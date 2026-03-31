import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { patients } from './patients';
import { encounters } from './encounters';

export const measurementTypes = sqliteTable('measurement_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'PHQ-9', 'GAD-7', 'Columbia Suicide Severity'
  description: text('description'),
  category: text('category'), // 'depression' | 'anxiety' | 'psychosis' | 'substance' | 'functional' | 'other'
  scoringInfo: text('scoring_info'), // JSON: { min, max, ranges: [{label, min, max}] }
  questions: text('questions'), // JSON array of question definitions
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const measurementResults = sqliteTable('measurement_results', {
  id: text('id').primaryKey(),
  measurementTypeId: text('measurement_type_id')
    .notNull()
    .references(() => measurementTypes.id),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  encounterId: text('encounter_id').references(() => encounters.id),
  totalScore: real('total_score'),
  itemScores: text('item_scores'), // JSON: individual item responses
  interpretation: text('interpretation'), // severity level derived from score
  administeredAt: text('administered_at').notNull(),
  administeredBy: text('administered_by').references(() => users.id),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
