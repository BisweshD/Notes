import { getDb } from '@/lib/db';
import { encounters, encounterRecordings, patients } from '@/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CreateEncounterData {
  patientId: string;
  clinicianId: string;
  organizationId: string;
  encounterType: string;
  scheduledAt?: string;
  chiefConcern?: string;
  location?: string;
}

export const encounterRepository = {
  findByPatientId(patientId: string) {
    const db = getDb();
    return db
      .select()
      .from(encounters)
      .where(and(eq(encounters.patientId, patientId), isNull(encounters.deletedAt)))
      .orderBy(desc(encounters.createdAt))
      .all();
  },

  findById(id: string) {
    const db = getDb();
    return db.select().from(encounters).where(eq(encounters.id, id)).get();
  },

  findByIdWithPatient(id: string) {
    const db = getDb();
    return db
      .select({
        id: encounters.id,
        patientId: encounters.patientId,
        clinicianId: encounters.clinicianId,
        organizationId: encounters.organizationId,
        encounterType: encounters.encounterType,
        status: encounters.status,
        scheduledAt: encounters.scheduledAt,
        startedAt: encounters.startedAt,
        endedAt: encounters.endedAt,
        durationSeconds: encounters.durationSeconds,
        chiefConcern: encounters.chiefConcern,
        location: encounters.location,
        isBillable: encounters.isBillable,
        metadata: encounters.metadata,
        createdAt: encounters.createdAt,
        updatedAt: encounters.updatedAt,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
      })
      .from(encounters)
      .innerJoin(patients, eq(encounters.patientId, patients.id))
      .where(eq(encounters.id, id))
      .get();
  },

  findByClinician(clinicianId: string, options?: { status?: string; limit?: number }) {
    const db = getDb();
    const conditions = [eq(encounters.clinicianId, clinicianId), isNull(encounters.deletedAt)];
    if (options?.status) {
      conditions.push(
        eq(encounters.status, options.status as typeof encounters.status.enumValues[number]),
      );
    }
    return db
      .select()
      .from(encounters)
      .where(and(...conditions))
      .orderBy(desc(encounters.createdAt))
      .limit(options?.limit ?? 50)
      .all();
  },

  create(data: CreateEncounterData) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.insert(encounters)
      .values({
        id,
        patientId: data.patientId,
        clinicianId: data.clinicianId,
        organizationId: data.organizationId,
        encounterType: data.encounterType as typeof encounters.encounterType.enumValues[number],
        status: 'scheduled',
        scheduledAt: data.scheduledAt,
        chiefConcern: data.chiefConcern,
        location: data.location as typeof encounters.location.enumValues[number] | undefined,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return this.findById(id)!;
  },

  updateStatus(id: string, status: string, extraFields?: Record<string, unknown>) {
    const db = getDb();
    const now = new Date().toISOString();

    db.update(encounters)
      .set({
        status: status as typeof encounters.status.enumValues[number],
        updatedAt: now,
        ...extraFields,
      })
      .where(eq(encounters.id, id))
      .run();

    return this.findById(id);
  },

  update(id: string, data: Partial<CreateEncounterData>) {
    const db = getDb();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.chiefConcern !== undefined) updateData.chiefConcern = data.chiefConcern;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.encounterType !== undefined) updateData.encounterType = data.encounterType;

    db.update(encounters).set(updateData).where(eq(encounters.id, id)).run();

    return this.findById(id);
  },

  // Recording management
  createRecording(encounterId: string) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    // Count existing recordings for this encounter
    const existing = db
      .select()
      .from(encounterRecordings)
      .where(eq(encounterRecordings.encounterId, encounterId))
      .all();

    db.insert(encounterRecordings)
      .values({
        id,
        encounterId,
        recordingNumber: existing.length + 1,
        status: 'recording',
        startedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return db.select().from(encounterRecordings).where(eq(encounterRecordings.id, id)).get()!;
  },

  updateRecording(id: string, data: Record<string, unknown>) {
    const db = getDb();
    const now = new Date().toISOString();

    db.update(encounterRecordings)
      .set({ ...data, updatedAt: now })
      .where(eq(encounterRecordings.id, id))
      .run();

    return db.select().from(encounterRecordings).where(eq(encounterRecordings.id, id)).get();
  },

  findRecordingsByEncounter(encounterId: string) {
    const db = getDb();
    return db
      .select()
      .from(encounterRecordings)
      .where(eq(encounterRecordings.encounterId, encounterId))
      .all();
  },
};
