import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { encounters, encounterRecordings } from './encounters';

export const transcriptSegments = sqliteTable('transcript_segments', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  recordingId: text('recording_id')
    .notNull()
    .references(() => encounterRecordings.id),
  segmentIndex: integer('segment_index').notNull(),
  speaker: text('speaker'), // 'clinician' | 'patient' | 'unknown' | custom label
  startTimeMs: integer('start_time_ms').notNull(),
  endTimeMs: integer('end_time_ms').notNull(),
  text: text('text').notNull(),
  confidence: real('confidence'), // 0.0–1.0 from ASR
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false),
  originalText: text('original_text'), // pre-edit text if corrected
  language: text('language').default('en'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
