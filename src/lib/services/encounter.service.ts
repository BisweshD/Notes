import { encounterRepository } from '@/lib/repositories/encounter.repository';
import { createEncounterSchema, type CreateEncounterInput } from '@/lib/validators/encounter';
import { NotFoundError, ValidationError, InvalidStateTransitionError } from '@/lib/errors';
import { ENCOUNTER_STATUS_TRANSITIONS, type EncounterStatus } from '@/lib/constants';

export const encounterService = {
  /**
   * List encounters for a patient
   */
  listByPatient(patientId: string) {
    return encounterRepository.findByPatientId(patientId);
  },

  /**
   * List encounters for a clinician
   */
  listByClinician(clinicianId: string, options?: { status?: string; limit?: number }) {
    return encounterRepository.findByClinician(clinicianId, options);
  },

  /**
   * Get encounter by ID with full details
   */
  getEncounter(id: string) {
    const encounter = encounterRepository.findById(id);
    if (!encounter) {
      throw new NotFoundError('Encounter', id);
    }
    return encounter;
  },

  /**
   * Get encounter with patient details
   */
  getEncounterWithPatient(id: string) {
    const encounter = encounterRepository.findByIdWithPatient(id);
    if (!encounter) {
      throw new NotFoundError('Encounter', id);
    }
    return encounter;
  },

  /**
   * Create a new encounter
   */
  createEncounter(input: CreateEncounterInput, clinicianId: string, organizationId: string) {
    const result = createEncounterSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError('Invalid encounter data', result.error.issues);
    }

    return encounterRepository.create({
      patientId: result.data.patientId,
      clinicianId,
      organizationId,
      encounterType: result.data.encounterType,
      scheduledAt: result.data.scheduledAt,
      chiefConcern: result.data.chiefConcern,
      location: result.data.location,
    });
  },

  /**
   * Transition encounter to a new status with state machine validation
   */
  transitionStatus(id: string, newStatus: EncounterStatus) {
    const encounter = this.getEncounter(id);
    const currentStatus = encounter.status as EncounterStatus;

    // Validate transition
    const allowedTransitions = ENCOUNTER_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions?.includes(newStatus)) {
      throw new InvalidStateTransitionError('Encounter', currentStatus, newStatus);
    }

    // Set extra fields based on transition
    const extraFields: Record<string, unknown> = {};

    if (newStatus === 'in_progress' && !encounter.startedAt) {
      extraFields.startedAt = new Date().toISOString();
    }

    if (newStatus === 'recording') {
      if (!encounter.startedAt) {
        extraFields.startedAt = new Date().toISOString();
      }
    }

    if (
      newStatus === 'signed' ||
      newStatus === 'cancelled' ||
      newStatus === 'amended'
    ) {
      if (!encounter.endedAt) {
        extraFields.endedAt = new Date().toISOString();
      }
      if (encounter.startedAt && !encounter.durationSeconds) {
        const start = new Date(encounter.startedAt).getTime();
        const end = new Date().getTime();
        extraFields.durationSeconds = Math.round((end - start) / 1000);
      }
    }

    return encounterRepository.updateStatus(id, newStatus, extraFields);
  },

  /**
   * Start recording for an encounter.
   * Transitions to 'recording' status and creates a recording record.
   */
  startRecording(id: string) {
    const encounter = this.getEncounter(id);
    const currentStatus = encounter.status as EncounterStatus;

    // Auto-transition to in_progress first if needed
    if (currentStatus === 'scheduled') {
      this.transitionStatus(id, 'in_progress');
    }

    // Now transition to recording
    const updated = this.transitionStatus(id, 'recording');
    const recording = encounterRepository.createRecording(id);

    return { encounter: updated, recording };
  },

  /**
   * Stop recording for an encounter.
   * Updates recording status and transitions encounter to processing.
   */
  stopRecording(id: string, recordingId: string) {
    const now = new Date().toISOString();

    encounterRepository.updateRecording(recordingId, {
      status: 'completed',
      endedAt: now,
    });

    return this.transitionStatus(id, 'processing');
  },

  /**
   * Get recordings for an encounter
   */
  getRecordings(encounterId: string) {
    return encounterRepository.findRecordingsByEncounter(encounterId);
  },
};
