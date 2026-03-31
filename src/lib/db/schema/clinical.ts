import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { patients } from './patients';
import { encounters } from './encounters';

export const diagnoses = sqliteTable('diagnoses', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  encounterId: text('encounter_id').references(() => encounters.id),
  code: text('code'), // ICD-10 code
  codeSystem: text('code_system').default('ICD-10'),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['primary', 'secondary', 'rule_out', 'resolved'],
  }),
  status: text('status', {
    enum: ['active', 'resolved', 'inactive'],
  })
    .notNull()
    .default('active'),
  onsetDate: text('onset_date'),
  resolvedDate: text('resolved_date'),
  notes: text('notes'),
  diagnosedBy: text('diagnosed_by')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
});

export const medications = sqliteTable('medications', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  name: text('name').notNull(), // generic name
  brandName: text('brand_name'),
  dosage: text('dosage'), // "150mg"
  frequency: text('frequency'), // "once daily"
  route: text('route'), // "oral" | "injectable" | "sublingual" etc.
  status: text('status', {
    enum: ['active', 'discontinued', 'on_hold', 'completed'],
  })
    .notNull()
    .default('active'),
  prescribedDate: text('prescribed_date'),
  discontinuedDate: text('discontinued_date'),
  discontinueReason: text('discontinue_reason'),
  indication: text('indication'),
  sideEffects: text('side_effects'), // JSON array
  adherenceNotes: text('adherence_notes'),
  prescribedBy: text('prescribed_by')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
});

export const medicationChanges = sqliteTable('medication_changes', {
  id: text('id').primaryKey(),
  medicationId: text('medication_id')
    .notNull()
    .references(() => medications.id),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  changeType: text('change_type', {
    enum: ['started', 'increased', 'decreased', 'discontinued', 'switched', 'renewed'],
  }).notNull(),
  previousDosage: text('previous_dosage'),
  newDosage: text('new_dosage'),
  reason: text('reason'),
  changedBy: text('changed_by')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const riskAssessments = sqliteTable('risk_assessments', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  patientId: text('patient_id')
    .notNull()
    .references(() => patients.id),
  riskType: text('risk_type', {
    enum: ['suicide', 'self_harm', 'violence', 'substance', 'functional_decline'],
  }).notNull(),
  level: text('level', {
    enum: ['low', 'moderate', 'high', 'imminent'],
  }).notNull(),
  riskFactors: text('risk_factors'), // JSON array
  protectiveFactors: text('protective_factors'), // JSON array
  interventions: text('interventions'), // JSON array
  safetyPlan: text('safety_plan'),
  notes: text('notes'),
  assessedBy: text('assessed_by')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
