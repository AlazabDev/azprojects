import { db } from './index.ts';
import { projects, projectPhases, architecturalBlueprints, fieldUpdates, syncLogs, users } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { registerOrInviteClient } from './users.ts';

export interface UserContext {
  email: string;
  role: string; // 'owner' | 'engineer' | 'client' | 'accountant'
  uid?: string;
}

/**
 * Enforce Row-Level Security (RLS) based on User Role:
 * - 'owner', 'engineer', 'accountant': Can view ALL projects and complete site data.
 * - 'client' (Project Owner): Strictly restricted to their OWN project(s) matching clientEmail.
 */
export async function getProjectsForUser(user: UserContext) {
  try {
    const isElevatedRole = ['owner', 'engineer', 'accountant', 'admin'].includes(user.role);

    if (isElevatedRole) {
      // Engineers & Managers see all projects across the company
      return await db.select().from(projects).orderBy(desc(projects.updatedAt));
    }

    // Client/Project Owner only sees their specific project matching their verified email
    const clientEmail = user.email.trim().toLowerCase();
    return await db
      .select()
      .from(projects)
      .where(eq(projects.clientEmail, clientEmail))
      .orderBy(desc(projects.updatedAt));
  } catch (error) {
    console.error('Failed to getProjectsForUser:', error);
    throw new Error('Database query failed for projects', { cause: error });
  }
}

/**
 * Get single project with RLS check
 */
export async function getProjectByIdForUser(projectId: number, user: UserContext) {
  try {
    const isElevatedRole = ['owner', 'engineer', 'accountant', 'admin'].includes(user.role);

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const project = result[0];

    // Check RLS permission
    if (!isElevatedRole) {
      const clientEmail = user.email.trim().toLowerCase();
      if (project.clientEmail.trim().toLowerCase() !== clientEmail) {
        throw new Error('Access denied: You are not authorized to view this project.');
      }
    }

    // Fetch related phases
    const phases = await db
      .select()
      .from(projectPhases)
      .where(eq(projectPhases.projectId, projectId));

    // Fetch blueprints
    const blueprints = await db
      .select()
      .from(architecturalBlueprints)
      .where(eq(architecturalBlueprints.projectId, projectId));

    // Fetch field updates
    const updates = await db
      .select()
      .from(fieldUpdates)
      .where(eq(fieldUpdates.projectId, projectId))
      .orderBy(desc(fieldUpdates.createdAt));

    return {
      ...project,
      phases,
      blueprints,
      fieldUpdates: updates,
    };
  } catch (error) {
    console.error('Failed to getProjectByIdForUser:', error);
    throw new Error('Database query failed for single project', { cause: error });
  }
}

/**
 * Seed or Sync Projects from Daftra, MagicPlan, and Milano.
 * Automatically extracts client_email and registers/invites the client into PostgreSQL.
 */
export async function syncProjectsFromIntegrations(sourceData: {
  source: 'daftra' | 'magicplan' | 'milano';
  projects: Array<{
    externalId?: string;
    code: string;
    name: string;
    clientEmail: string;
    clientName: string;
    clientPhone?: string;
    status: string;
    progress: number;
    budget: string;
    spent: string;
    location?: string;
    phases?: Array<{
      externalId?: string;
      name: string;
      progress: number;
      budget: string;
      spent: string;
      status: string;
      startDate?: string;
      endDate?: string;
    }>;
    blueprints?: Array<{
      externalId?: string;
      title: string;
      type: string;
      fileUrl: string;
      thumbnailUrl?: string;
      magicPlanProjectId?: string;
    }>;
  }>;
}) {
  const syncedProjects = [];

  for (const item of sourceData.projects) {
    // 1. Check if project already exists
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.code, item.code))
      .limit(1);

    let currentProject;

    if (existing.length > 0) {
      const updated = await db
        .update(projects)
        .set({
          externalId: item.externalId || existing[0].externalId,
          name: item.name,
          clientEmail: item.clientEmail.trim().toLowerCase(),
          clientName: item.clientName,
          clientPhone: item.clientPhone || existing[0].clientPhone,
          status: item.status,
          progress: item.progress,
          budget: item.budget,
          spent: item.spent,
          location: item.location || existing[0].location,
          source: sourceData.source,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(projects.id, existing[0].id))
        .returning();
      currentProject = updated[0];
    } else {
      const inserted = await db
        .insert(projects)
        .values({
          externalId: item.externalId,
          code: item.code,
          name: item.name,
          clientEmail: item.clientEmail.trim().toLowerCase(),
          clientName: item.clientName,
          clientPhone: item.clientPhone,
          status: item.status,
          progress: item.progress,
          budget: item.budget,
          spent: item.spent,
          location: item.location,
          source: sourceData.source,
        })
        .returning();
      currentProject = inserted[0];
    }

    // 2. Automatically register / invite client in users table based on clientEmail
    if (item.clientEmail) {
      await registerOrInviteClient(
        item.clientEmail.trim().toLowerCase(),
        item.clientName || 'عميل المشروع',
        item.clientPhone
      );
    }

    // 3. Upsert Phases
    if (item.phases && item.phases.length > 0) {
      for (const ph of item.phases) {
        const existingPhase = await db
          .select()
          .from(projectPhases)
          .where(eq(projectPhases.projectId, currentProject.id))
          .limit(10);

        const match = existingPhase.find(p => p.name === ph.name);
        if (!match) {
          await db.insert(projectPhases).values({
            projectId: currentProject.id,
            externalId: ph.externalId,
            name: ph.name,
            progress: ph.progress,
            budget: ph.budget,
            spent: ph.spent,
            status: ph.status,
            startDate: ph.startDate,
            endDate: ph.endDate,
          });
        }
      }
    }

    // 4. Upsert Blueprints
    if (item.blueprints && item.blueprints.length > 0) {
      for (const bp of item.blueprints) {
        const existingBp = await db
          .select()
          .from(architecturalBlueprints)
          .where(eq(architecturalBlueprints.projectId, currentProject.id))
          .limit(10);

        const match = existingBp.find(b => b.title === bp.title);
        if (!match) {
          await db.insert(architecturalBlueprints).values({
            projectId: currentProject.id,
            externalId: bp.externalId,
            title: bp.title,
            type: bp.type,
            fileUrl: bp.fileUrl,
            thumbnailUrl: bp.thumbnailUrl,
            magicPlanProjectId: bp.magicPlanProjectId,
          });
        }
      }
    }

    syncedProjects.push(currentProject);
  }

  // 5. Log the synchronization event
  await db.insert(syncLogs).values({
    source: sourceData.source,
    status: 'success',
    itemsSynced: syncedProjects.length,
    details: `تمت مزامنة ${syncedProjects.length} مشروع وحوكمة بريد العملاء في سوبابيس / كلاود إس كيو إل بنجاح.`,
  });

  return syncedProjects;
}

/**
 * Add a new field update (e.g. from WhatsApp or Engineer app)
 */
export async function addFieldUpdate(data: {
  projectId: number;
  phaseId?: number;
  senderName: string;
  senderPhone?: string;
  senderRole?: string;
  messageType: string;
  content: string;
  mediaUrl?: string;
}) {
  try {
    const result = await db.insert(fieldUpdates).values(data).returning();
    return result[0];
  } catch (error) {
    console.error('Failed to addFieldUpdate:', error);
    throw new Error('Database error adding field update', { cause: error });
  }
}
