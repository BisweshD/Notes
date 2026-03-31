import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { organizations, users } from './auth';
import { encounters } from './encounters';
import { transcriptSegments } from './transcripts';

export const noteTemplates = sqliteTable('note_templates', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id), // NULL = system default
  name: text('name').notNull(),
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
  sections: text('sections').notNull(), // JSON array of section definitions
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const encounterNotes = sqliteTable('encounter_notes', {
  id: text('id').primaryKey(),
  encounterId: text('encounter_id')
    .notNull()
    .references(() => encounters.id),
  templateId: text('template_id').references(() => noteTemplates.id),
  version: integer('version').notNull().default(1),
  status: text('status', {
    enum: ['draft', 'ai_generated', 'in_review', 'signed', 'amended', 'addendum'],
  })
    .notNull()
    .default('draft'),
  signedAt: text('signed_at'),
  signedBy: text('signed_by').references(() => users.id),
  amendmentReason: text('amendment_reason'),
  previousVersionId: text('previous_version_id'), // self-reference for version chain
  isLocked: integer('is_locked', { mode: 'boolean' }).default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const noteSections = sqliteTable('note_sections', {
  id: text('id').primaryKey(),
  noteId: text('note_id')
    .notNull()
    .references(() => encounterNotes.id),
  sectionKey: text('section_key').notNull(), // e.g. 'chief_concern', 'mse', 'assessment', 'plan'
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  sortOrder: integer('sort_order').notNull(),
  source: text('source', {
    enum: ['manual', 'ai_generated', 'ai_edited', 'template_default'],
  })
    .notNull()
    .default('manual'),
  aiConfidence: real('ai_confidence'),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const evidenceLinks = sqliteTable('evidence_links', {
  id: text('id').primaryKey(),
  noteSectionId: text('note_section_id')
    .notNull()
    .references(() => noteSections.id),
  transcriptSegmentId: text('transcript_segment_id')
    .notNull()
    .references(() => transcriptSegments.id),
  relevanceScore: real('relevance_score'),
  highlightStart: integer('highlight_start'),
  highlightEnd: integer('highlight_end'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
