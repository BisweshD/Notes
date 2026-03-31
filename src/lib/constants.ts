// Application-wide constants

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'PsychScribe';

// Encounter statuses in lifecycle order
export const ENCOUNTER_STATUSES = [
  'scheduled',
  'in_progress',
  'recording',
  'processing',
  'review',
  'signed',
  'amended',
  'cancelled',
] as const;

export type EncounterStatus = (typeof ENCOUNTER_STATUSES)[number];

// Valid encounter status transitions
export const ENCOUNTER_STATUS_TRANSITIONS: Record<EncounterStatus, EncounterStatus[]> = {
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['recording', 'cancelled'],
  recording: ['processing', 'in_progress', 'cancelled'],
  processing: ['review', 'cancelled'],
  review: ['signed', 'processing', 'cancelled'],
  signed: ['amended'],
  amended: [],
  cancelled: [],
};

export const ENCOUNTER_TYPES = [
  'initial_evaluation',
  'follow_up',
  'med_management',
  'therapy',
  'urgent',
  'telehealth',
] as const;

export type EncounterType = (typeof ENCOUNTER_TYPES)[number];

export const ENCOUNTER_TYPE_LABELS: Record<EncounterType, string> = {
  initial_evaluation: 'Initial Evaluation',
  follow_up: 'Follow-Up',
  med_management: 'Medication Management',
  therapy: 'Psychotherapy',
  urgent: 'Urgent Visit',
  telehealth: 'Telehealth',
};

// Note statuses
export const NOTE_STATUSES = [
  'draft',
  'ai_generated',
  'in_review',
  'signed',
  'amended',
  'addendum',
] as const;

export type NoteStatus = (typeof NOTE_STATUSES)[number];

// Note section keys (standard psychiatry note structure)
export const NOTE_SECTION_KEYS = [
  'chief_concern',
  'history_present_illness',
  'subjective',
  'objective',
  'mental_status_exam',
  'risk_assessment',
  'diagnoses',
  'medications',
  'assessment',
  'plan',
  'follow_up',
] as const;

export type NoteSectionKey = (typeof NOTE_SECTION_KEYS)[number];

export const NOTE_SECTION_LABELS: Record<NoteSectionKey, string> = {
  chief_concern: 'Chief Concern',
  history_present_illness: 'History of Present Illness',
  subjective: 'Subjective',
  objective: 'Objective',
  mental_status_exam: 'Mental Status Exam',
  risk_assessment: 'Risk Assessment',
  diagnoses: 'Diagnoses',
  medications: 'Medications & Adherence',
  assessment: 'Assessment',
  plan: 'Plan',
  follow_up: 'Follow-Up',
};

// Patient statuses
export const PATIENT_STATUSES = ['active', 'inactive', 'discharged'] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

// User roles
export const USER_ROLES = ['clinician', 'admin', 'supervisor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Risk levels
export const RISK_LEVELS = ['low', 'moderate', 'high', 'imminent'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// Risk types
export const RISK_TYPES = [
  'suicide',
  'self_harm',
  'violence',
  'substance',
  'functional_decline',
] as const;
export type RiskType = (typeof RISK_TYPES)[number];

// Recording statuses
export const RECORDING_STATUSES = ['recording', 'paused', 'completed', 'failed'] as const;
export type RecordingStatus = (typeof RECORDING_STATUSES)[number];

// Processing job types
export const JOB_TYPES = ['transcription', 'diarization', 'extraction', 'note_generation'] as const;
export type JobType = (typeof JOB_TYPES)[number];

// Processing job statuses
export const JOB_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

// Audio settings
export const AUDIO_CHUNK_INTERVAL_MS = 5000;
export const AUDIO_MIME_TYPE = 'audio/webm;codecs=opus';
export const AUDIO_FALLBACK_MIME_TYPE = 'audio/webm';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
