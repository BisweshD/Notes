import { getDb } from '@/lib/db';
import {
  encounterNotes,
  noteSections,
  noteTemplates,
  evidenceLinks,
} from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { NoteSectionDraft } from '@/lib/ai/types';

export const noteRepository = {
  // ---- Note Templates ----

  findTemplateByType(encounterType: string) {
    const db = getDb();
    return db
      .select()
      .from(noteTemplates)
      .where(
        and(
          eq(
            noteTemplates.encounterType,
            encounterType as typeof noteTemplates.encounterType.enumValues[number],
          ),
          eq(noteTemplates.isDefault, true),
          eq(noteTemplates.isActive, true),
        ),
      )
      .get();
  },

  // ---- Encounter Notes ----

  findNoteByEncounter(encounterId: string) {
    const db = getDb();
    return db
      .select()
      .from(encounterNotes)
      .where(eq(encounterNotes.encounterId, encounterId))
      .orderBy(desc(encounterNotes.version))
      .get();
  },

  findNoteById(id: string) {
    const db = getDb();
    return db.select().from(encounterNotes).where(eq(encounterNotes.id, id)).get();
  },

  createNote(data: {
    encounterId: string;
    templateId?: string;
    status?: string;
  }) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.insert(encounterNotes)
      .values({
        id,
        encounterId: data.encounterId,
        templateId: data.templateId,
        version: 1,
        status: (data.status || 'draft') as typeof encounterNotes.status.enumValues[number],
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return this.findNoteById(id)!;
  },

  updateNoteStatus(
    id: string,
    status: string,
    extraFields?: { signedAt?: string; signedBy?: string; isLocked?: boolean },
  ) {
    const db = getDb();
    const now = new Date().toISOString();

    db.update(encounterNotes)
      .set({
        status: status as typeof encounterNotes.status.enumValues[number],
        updatedAt: now,
        ...extraFields,
      })
      .where(eq(encounterNotes.id, id))
      .run();

    return this.findNoteById(id);
  },

  // ---- Note Sections ----

  findSectionsByNote(noteId: string) {
    const db = getDb();
    return db
      .select()
      .from(noteSections)
      .where(eq(noteSections.noteId, noteId))
      .orderBy(asc(noteSections.sortOrder))
      .all();
  },

  findSectionById(id: string) {
    const db = getDb();
    return db.select().from(noteSections).where(eq(noteSections.id, id)).get();
  },

  createSections(noteId: string, drafts: NoteSectionDraft[]) {
    const db = getDb();
    const now = new Date().toISOString();

    return drafts.map((draft, index) => {
      const id = uuidv4();
      db.insert(noteSections)
        .values({
          id,
          noteId,
          sectionKey: draft.sectionKey,
          title: draft.title,
          content: draft.content,
          sortOrder: index,
          source: 'ai_generated',
          aiConfidence: draft.confidence,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      return { id, sectionKey: draft.sectionKey };
    });
  },

  updateSectionContent(id: string, content: string, source?: string) {
    const db = getDb();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      content,
      updatedAt: now,
    };

    if (source) {
      updateData.source = source;
    }

    db.update(noteSections).set(updateData).where(eq(noteSections.id, id)).run();

    return this.findSectionById(id);
  },

  approveSection(id: string) {
    const db = getDb();
    const now = new Date().toISOString();

    db.update(noteSections)
      .set({ isApproved: true, updatedAt: now })
      .where(eq(noteSections.id, id))
      .run();

    return this.findSectionById(id);
  },

  // ---- Evidence Links ----

  createEvidenceLinks(
    links: Array<{
      noteSectionId: string;
      transcriptSegmentId: string;
      relevanceScore?: number;
    }>,
  ) {
    const db = getDb();
    const now = new Date().toISOString();

    for (const link of links) {
      db.insert(evidenceLinks)
        .values({
          id: uuidv4(),
          noteSectionId: link.noteSectionId,
          transcriptSegmentId: link.transcriptSegmentId,
          relevanceScore: link.relevanceScore,
          createdAt: now,
        })
        .run();
    }
  },

  findEvidenceLinksBySection(sectionId: string) {
    const db = getDb();
    return db
      .select()
      .from(evidenceLinks)
      .where(eq(evidenceLinks.noteSectionId, sectionId))
      .all();
  },
};
