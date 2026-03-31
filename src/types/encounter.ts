export interface Encounter {
  id: string;
  patientId: string;
  clinicianId: string;
  organizationId: string;
  encounterType: string;
  status: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  chiefConcern?: string | null;
  location?: string | null;
  isBillable?: boolean | null;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EncounterWithPatient extends Encounter {
  patientFirstName: string;
  patientLastName: string;
}
