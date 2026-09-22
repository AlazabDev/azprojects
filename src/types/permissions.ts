/**
 * AzProjects - Central Permissions & RBAC Matrix
 * تعريف الصلاحيات المؤسسية المركزية والأدوار المعتمدة
 */

export type AppPermission =
  | 'projects.read'
  | 'projects.create'
  | 'projects.update'
  | 'projects.delete'
  | 'projects.costs.read'
  | 'projects.costs.manage'
  | 'projects.documents.read'
  | 'projects.documents.manage'
  | 'projects.phases.manage'
  | 'projects.tasks.manage'
  | 'integrations.daftra.read'
  | 'integrations.daftra.sync'
  | 'integrations.magicplan.read'
  | 'integrations.magicplan.sync'
  | 'integrations.whatsapp.manage'
  | 'ai.use'
  | 'users.read'
  | 'users.manage'
  | 'settings.read'
  | 'settings.manage'
  | 'storage.read'
  | 'storage.write'
  | 'storage.manage';

export type UserRole =
  | 'owner'
  | 'project_manager'
  | 'architect'
  | 'civil_engineer'
  | 'contractor'
  | 'consultant'
  | 'client'
  | 'observer';

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  // Owner (Administrator): Full system access
  owner: [
    'projects.read',
    'projects.create',
    'projects.update',
    'projects.delete',
    'projects.costs.read',
    'projects.costs.manage',
    'projects.documents.read',
    'projects.documents.manage',
    'projects.phases.manage',
    'projects.tasks.manage',
    'integrations.daftra.read',
    'integrations.daftra.sync',
    'integrations.magicplan.read',
    'integrations.magicplan.sync',
    'integrations.whatsapp.manage',
    'ai.use',
    'users.read',
    'users.manage',
    'settings.read',
    'settings.manage',
    'storage.read',
    'storage.write',
    'storage.manage',
  ],

  // Project Manager: Manage projects, finances, tasks, team, integrations
  project_manager: [
    'projects.read',
    'projects.create',
    'projects.update',
    'projects.costs.read',
    'projects.costs.manage',
    'projects.documents.read',
    'projects.documents.manage',
    'projects.phases.manage',
    'projects.tasks.manage',
    'integrations.daftra.read',
    'integrations.daftra.sync',
    'integrations.magicplan.read',
    'integrations.magicplan.sync',
    'integrations.whatsapp.manage',
    'ai.use',
    'users.read',
    'settings.read',
    'storage.read',
    'storage.write',
  ],

  // Architect: Design, MagicPlan, documents, tasks, AI
  architect: [
    'projects.read',
    'projects.update',
    'projects.costs.read',
    'projects.documents.read',
    'projects.documents.manage',
    'projects.phases.manage',
    'projects.tasks.manage',
    'integrations.magicplan.read',
    'integrations.magicplan.sync',
    'ai.use',
    'storage.read',
    'storage.write',
  ],

  // Civil Engineer: Site execution, tasks, documents, WhatsApp field updates
  civil_engineer: [
    'projects.read',
    'projects.update',
    'projects.costs.read',
    'projects.documents.read',
    'projects.documents.manage',
    'projects.phases.manage',
    'projects.tasks.manage',
    'integrations.whatsapp.manage',
    'ai.use',
    'storage.read',
    'storage.write',
  ],

  // Contractor: Tasks, view documents, view phases
  contractor: [
    'projects.read',
    'projects.documents.read',
    'projects.tasks.manage',
    'storage.read',
    'storage.write',
  ],

  // Consultant: Review & Audit
  consultant: [
    'projects.read',
    'projects.costs.read',
    'projects.documents.read',
    'storage.read',
  ],

  // Client: View own project details & approved documents only
  client: [
    'projects.read',
    'projects.costs.read',
    'projects.documents.read',
    'storage.read',
  ],

  // Observer: Read-only access to basic project info and documents
  observer: [
    'projects.read',
    'projects.documents.read',
    'storage.read',
  ],
};

export function hasPermission(role: UserRole | string | undefined, permission: AppPermission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}
