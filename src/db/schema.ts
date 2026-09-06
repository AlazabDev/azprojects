import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table with role-based access control and invitation tracking
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or generated UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  role: text('role').notNull().default('client'), // 'owner' | 'engineer' | 'client' | 'accountant'
  phoneNumber: text('phone_number'),
  status: text('status').notNull().default('active'), // 'active' | 'invited' | 'pending'
  inviteSentAt: timestamp('invite_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Projects table synced from Daftra, MagicPlan & Milano
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  externalId: text('external_id'), // ID from Daftra / MagicPlan
  code: text('code').notNull(), // e.g. PRJ-ARB-01
  name: text('name').notNull(),
  clientEmail: text('client_email').notNull(), // Owner's email extracted from Daftra for RLS / client portal
  clientName: text('client_name'),
  clientPhone: text('client_phone'),
  status: text('status').notNull().default('in_progress'), // 'planning' | 'in_progress' | 'completed' | 'on_hold'
  progress: integer('progress').notNull().default(0), // 0 - 100%
  budget: text('budget').notNull().default('0'),
  spent: text('spent').notNull().default('0'),
  location: text('location'),
  source: text('source').notNull().default('daftra'), // 'daftra' | 'magicplan' | 'milano' | 'manual'
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Project Phases table (structural, arabesque, finishes, MEP, handover)
export const projectPhases = pgTable('project_phases', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  externalId: text('external_id'),
  name: text('name').notNull(),
  progress: integer('progress').notNull().default(0),
  budget: text('budget').notNull().default('0'),
  spent: text('spent').notNull().default('0'),
  status: text('status').notNull().default('pending'), // 'completed' | 'in_progress' | 'pending'
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Architectural Blueprints & Documents synced from MagicPlan
export const architecturalBlueprints = pgTable('architectural_blueprints', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  externalId: text('external_id'),
  title: text('title').notNull(),
  type: text('type').notNull().default('2D_PLAN'), // '2D_PLAN' | '3D_MODEL' | 'CAD_DWG' | 'PDF_SPEC'
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  magicPlanProjectId: text('magicplan_project_id'),
  syncedAt: timestamp('synced_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Field updates, site photos, and WhatsApp records linked to project & phase
export const fieldUpdates = pgTable('field_updates', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  phaseId: integer('phase_id').references(() => projectPhases.id),
  senderName: text('sender_name').notNull(),
  senderPhone: text('sender_phone'),
  senderRole: text('sender_role').notNull().default('مهندس الموقع'),
  messageType: text('message_type').notNull().default('text'), // 'text' | 'image' | 'audio' | 'document'
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  status: text('status').notNull().default('verified'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sync logs tracking synchronizations from Daftra, MagicPlan, and Milano
export const syncLogs = pgTable('sync_logs', {
  id: serial('id').primaryKey(),
  source: text('source').notNull(), // 'daftra' | 'magicplan' | 'milano'
  status: text('status').notNull().default('success'), // 'success' | 'failed' | 'in_progress'
  itemsSynced: integer('items_synced').notNull().default(0),
  details: text('details'),
  syncedAt: timestamp('synced_at').defaultNow(),
});

// Relations definitions
export const usersRelations = relations(users, () => ({}));

export const projectsRelations = relations(projects, ({ many }) => ({
  phases: many(projectPhases),
  blueprints: many(architecturalBlueprints),
  fieldUpdates: many(fieldUpdates),
}));

export const projectPhasesRelations = relations(projectPhases, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectPhases.projectId],
    references: [projects.id],
  }),
  fieldUpdates: many(fieldUpdates),
}));

export const architecturalBlueprintsRelations = relations(architecturalBlueprints, ({ one }) => ({
  project: one(projects, {
    fields: [architecturalBlueprints.projectId],
    references: [projects.id],
  }),
}));

export const fieldUpdatesRelations = relations(fieldUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [fieldUpdates.projectId],
    references: [projects.id],
  }),
  phase: one(projectPhases, {
    fields: [fieldUpdates.phaseId],
    references: [projectPhases.id],
  }),
}));
