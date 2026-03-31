import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { encounters } from './encounters';

export const processingJobs = sqliteTable('processing_jobs', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  jobType: text('job_type', {
    enum: ['transcription', 'diarization', 'extraction', 'note_generation'],
  }).notNull(),
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  provider: text('provider'), // which provider was used
  inputData: text('input_data'), // JSON: input params
  outputData: text('output_data'), // JSON: results
  errorMessage: text('error_message'),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const extractionResults = sqliteTable('extraction_results', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  jobId: text('job_id')
    .notNull()
    .references(() => processingJobs.id),
  extractionType: text('extraction_type', {
    enum: ['symptoms', 'medications', 'diagnoses', 'risk_factors', 'mse', 'plan_items'],
  }).notNull(),
  data: text('data').notNull(), // JSON structured extraction
  confidence: real('confidence'),
  sourceSegments: text('source_segments'), // JSON array of transcript_segment_ids
  isReviewed: integer('is_reviewed', { mode: 'boolean' }).default(false),
  reviewedBy: text('reviewed_by').references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
