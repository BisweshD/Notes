import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { organizations, users } from './auth';

export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  medicalRecordNumber: text('medical_record_number'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  preferredName: text('preferred_name'),
  dateOfBirth: text('date_of_birth').notNull(), // ISO date string YYYY-MM-DD
  sex: text('sex', { enum: ['male', 'female', 'other', 'unknown'] }),
  genderIdentity: text('gender_identity'),
  pronouns: text('pronouns'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'), // JSON: { street, city, state, zip }
  emergencyContact: text('emergency_contact'), // JSON: { name, relationship, phone }
  insuranceInfo: text('insurance_info'), // JSON blob
  primaryLanguage: text('primary_language').default('English'),
  status: text('status', { enum: ['active', 'inactive', 'discharged'] })
    .notNull()
    .default('active'),
  notes: text('notes'), // free-text clinician notes about the patient
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'), // soft delete
});
