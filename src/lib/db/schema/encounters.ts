import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { organizations, users } from './auth';
import { patients } from './patients';

export const encounters = sqliteTable('encounters', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  clinicianId: text('clinician_id')
    .notNull()
    .references(() => users.id),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  encounterType: text('encounter_type', {
    enum: [
      'initial_evaluation',
      'follow_up',
      'med_management',
      'therapy',
      'urgent',
      'telehealth',
    ],
  }).notNull(),
  status: text('status', {
    enum: [
      'scheduled',
      'in_progress',
      'recording',
      'processing',
      'review',
      'signed',
      'amended',
      'cancelled',
    ],
  })
    .notNull()
    .default('scheduled'),
  scheduledAt: text('scheduled_at'),
  startedAt: text('started_at'),
  endedAt: text('ended_at'),
  durationSeconds: integer('duration_seconds'),
  chiefConcern: text('chief_concern'),
  location: text('location', { enum: ['in_person', 'telehealth'] }),
  isBillable: integer('is_billable', { mode: 'boolean' }).default(true),
  metadata: text('metadata'), // JSON for extensibility
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
});

export const encounterRecordings = sqliteTable('encounter_recordings', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  recordingNumber: integer('recording_number').notNull().default(1),
  status: text('status', {
    enum: ['recording', 'paused', 'completed', 'failed'],
  })
    .notNull()
    .default('recording'),
  filePath: text('file_path'),
  fileSizeBytes: integer('file_size_bytes'),
  mimeType: text('mime_type').default('audio/webm'),
  durationSeconds: integer('duration_seconds'),
  sampleRate: integer('sample_rate'),
  channels: integer('channels').default(1),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  metadata: text('metadata'), // JSON: device info, browser, etc.
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
