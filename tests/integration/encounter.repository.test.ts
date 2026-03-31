import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/test-db';
import { organizations, users, patients, encounters } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

describe('Encounter Repository (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db'];
  let orgId: string;
  let userId: string;
  let patientId: string;

  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;

    orgId = uuidv4();
    userId = uuidv4();
    patientId = uuidv4();

    db.insert(organizations)
      .values({ id: orgId, name: 'Test Org' })
      .run();

    db.insert(users)
      .values({
        id: userId,
        email: 'test@test.com',
        passwordHash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        role: 'clinician',
        organizationId: orgId,
      })
      .run();

    db.insert(patients)
      .values({
        id: patientId,
        organizationId: orgId,
        firstName: 'James',
        lastName: 'Morrison',
        dateOfBirth: '1985-03-15',
        createdBy: userId,
      })
      .run();
  });

  it('creates an encounter', () => {
    const encounterId = uuidv4();

    db.insert(encounters)
      .values({
        id: encounterId,
        patientId,
        clinicianId: userId,
        organizationId: orgId,
        encounterType: 'follow_up',
        status: 'scheduled',
        chiefConcern: 'Depression follow-up',
      })
      .run();

    const found = db.select().from(encounters).where(eq(encounters.id, encounterId)).get();

    expect(found).toBeTruthy();
    expect(found!.encounterType).toBe('follow_up');
    expect(found!.status).toBe('scheduled');
    expect(found!.chiefConcern).toBe('Depression follow-up');
  });

  it('updates encounter status', () => {
    const encounterId = uuidv4();

    db.insert(encounters)
      .values({
        id: encounterId,
        patientId,
        clinicianId: userId,
        organizationId: orgId,
        encounterType: 'follow_up',
        status: 'scheduled',
      })
      .run();

    db.update(encounters)
      .set({
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      })
      .where(eq(encounters.id, encounterId))
      .run();

    const updated = db.select().from(encounters).where(eq(encounters.id, encounterId)).get();
    expect(updated!.status).toBe('in_progress');
    expect(updated!.startedAt).toBeTruthy();
  });

  it('supports all encounter types', () => {
    const types = [
      'initial_evaluation',
      'follow_up',
      'med_management',
      'therapy',
      'urgent',
      'telehealth',
    ] as const;

    for (const type of types) {
      const id = uuidv4();
      db.insert(encounters)
        .values({
          id,
          patientId,
          clinicianId: userId,
          organizationId: orgId,
          encounterType: type,
          status: 'scheduled',
        })
        .run();

      const found = db.select().from(encounters).where(eq(encounters.id, id)).get();
      expect(found!.encounterType).toBe(type);
    }
  });

  it('supports all encounter statuses', () => {
    const statuses = [
      'scheduled',
      'in_progress',
      'recording',
      'processing',
      'review',
      'signed',
      'amended',
      'cancelled',
    ] as const;

    for (const status of statuses) {
      const id = uuidv4();
      db.insert(encounters)
        .values({
          id,
          patientId,
          clinicianId: userId,
          organizationId: orgId,
          encounterType: 'follow_up',
          status,
        })
        .run();

      const found = db.select().from(encounters).where(eq(encounters.id, id)).get();
      expect(found!.status).toBe(status);
    }
  });
});
