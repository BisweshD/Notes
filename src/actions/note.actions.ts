'use server';

import { requireAuth } from '@/lib/auth/session';
import { noteRepository } from '@/lib/repositories/note.repository';
import { encounterRepository } from '@/lib/repositories/encounter.repository';
import { isAppError } from '@/lib/errors';

export async function updateNoteSectionAction(sectionId: string, content: string) {
  try {
    await requireAuth();
    const section = noteRepository.updateSectionContent(sectionId, content, 'ai_edited');
    return { success: true as const, section };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to update section',
    };
  }
}

export async function approveNoteSectionAction(sectionId: string) {
  try {
    await requireAuth();
    const section = noteRepository.approveSection(sectionId);
    return { success: true as const, section };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to approve section',
    };
  }
}

export async function signNoteAction(noteId: string) {
  try {
    const user = await requireAuth();

    // Update note status to signed
    const note = noteRepository.updateNoteStatus(noteId, 'signed', {
      signedAt: new Date().toISOString(),
      signedBy: user.id,
      isLocked: true,
    });

    if (!note) {
      return { success: false as const, error: 'Note not found' };
    }

    // Update encounter status to signed
    encounterRepository.updateStatus(note.encounterId, 'signed', {
      endedAt: new Date().toISOString(),
    });

    return { success: true as const, note };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to sign note',
    };
  }
}
