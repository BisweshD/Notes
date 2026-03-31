import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { patients } from './patients';

// Audit logs are IMMUTABLE — no updated_at, no soft delete
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action', {
    enum: ['create', 'read', 'update', 'delete', 'sign', 'export', 'login', 'logout'],
  }).notNull(),
  resourceType: text('resource_type').notNull(), // 'patient' | 'encounter' | 'note' | 'recording' etc.
  resourceId: text('resource_id'),
  description: text('description'),
  metadata: text('metadata'), // JSON: additional context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const consentRecords = sqliteTable('consent_records', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  consentType: text('consent_type', {
    enum: ['recording', 'ai_processing', 'treatment', 'telehealth'],
  }).notNull(),
  status: text('status', {
    enum: ['granted', 'revoked', 'expired'],
  }).notNull(),
  grantedAt: text('granted_at'),
  revokedAt: text('revoked_at'),
  expiresAt: text('expires_at'),
  notes: text('notes'),
  recordedBy: text('recorded_by')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const followUpTasks = sqliteTable('follow_up_tasks', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id'),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  assignedTo: text('assigned_to').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', {
    enum: ['medication', 'referral', 'lab', 'follow_up', 'patient_task', 'other'],
  }),
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  priority: text('priority', {
    enum: ['low', 'normal', 'high', 'urgent'],
  }).default('normal'),
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  completedBy: text('completed_by').references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
