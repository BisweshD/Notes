'use server';

import { requireAuth } from '@/lib/auth/session';
import { encounterService } from '@/lib/services/encounter.service';
import { isAppError } from '@/lib/errors';
import type { EncounterStatus } from '@/lib/constants';

export async function createEncounterAction(formData: FormData) {
  try {
    const user = await requireAuth();

    const input = {
      patientId: formData.get('patientId') as string,
      encounterType: formData.get('encounterType') as string,
      chiefConcern: (formData.get('chiefConcern') as string) || undefined,
      location: (formData.get('location') as string) || undefined,
      scheduledAt: (formData.get('scheduledAt') as string) || undefined,
    };

    const encounter = encounterService.createEncounter(
      {
        ...input,
        encounterType: input.encounterType as 'initial_evaluation' | 'follow_up' | 'med_management' | 'therapy' | 'urgent' | 'telehealth',
        location: input.location as 'in_person' | 'telehealth' | undefined,
      },
      user.id,
      user.organizationId,
    );

    return { success: true as const, encounter };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to create encounter',
    };
  }
}

export async function transitionEncounterAction(encounterId: string, newStatus: EncounterStatus) {
  try {
    await requireAuth();
    const encounter = encounterService.transitionStatus(encounterId, newStatus);
    return { success: true as const, encounter };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to update encounter status',
    };
  }
}

export async function startRecordingAction(encounterId: string) {
  try {
    await requireAuth();
    const result = encounterService.startRecording(encounterId);
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to start recording',
    };
  }
}

export async function stopRecordingAction(encounterId: string, recordingId: string) {
  try {
    await requireAuth();
    const encounter = encounterService.stopRecording(encounterId, recordingId);
    return { success: true as const, encounter };
  } catch (error) {
    return {
      success: false as const,
      error: isAppError(error) ? error.message : 'Failed to stop recording',
    };
  }
}
