import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/test-db';
import { organizations, users, patients } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, isNull, and, or, like } from 'drizzle-orm';

describe('Patient Repository (Integration)', () => {
  let db: ReturnType<typeof createTestDb>['db'];
  let orgId: string;
  let userId: string;

  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;

    // Seed required parent records
    orgId = uuidv4();
    userId = uuidv4();

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
  });

  it('creates a patient and retrieves it', () => {
    const patientId = uuidv4();

    db.insert(patients)
      .values({
        id: patientId,
        organizationId: orgId,
        firstName: 'James',
        lastName: 'Morrison',
        dateOfBirth: '1985-03-15',
        sex: 'male',
        status: 'active',
        createdBy: userId,
      })
      .run();

    const found = db.select().from(patients).where(eq(patients.id, patientId)).get();

    expect(found).toBeTruthy();
    expect(found!.firstName).toBe('James');
    expect(found!.lastName).toBe('Morrison');
    expect(found!.dateOfBirth).toBe('1985-03-15');
    expect(found!.status).toBe('active');
  });

  it('soft deletes a patient', () => {
    const patientId = uuidv4();

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

    // Soft delete
    db.update(patients)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(patients.id, patientId))
      .run();

    // Should still exist
    const found = db.select().from(patients).where(eq(patients.id, patientId)).get();
    expect(found).toBeTruthy();
    expect(found!.deletedAt).toBeTruthy();

    // Should not appear in active queries
    const active = db
      .select()
      .from(patients)
      .where(and(eq(patients.organizationId, orgId), isNull(patients.deletedAt)))
      .all();
    expect(active).toHaveLength(0);
  });

  it('filters patients by search term', () => {
    const names = [
      { first: 'James', last: 'Morrison' },
      { first: 'Maria', last: 'Santos' },
      { first: 'Alex', last: 'Park' },
    ];

    for (const name of names) {
      db.insert(patients)
        .values({
          id: uuidv4(),
          organizationId: orgId,
          firstName: name.first,
          lastName: name.last,
          dateOfBirth: '1990-01-01',
          createdBy: userId,
        })
        .run();
    }

    // Search by first name
    const searchFirst = db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, orgId),
          isNull(patients.deletedAt),
          or(like(patients.firstName, '%Mar%'), like(patients.lastName, '%Mar%')),
        ),
      )
      .all();
    expect(searchFirst).toHaveLength(1);
    expect(searchFirst[0].firstName).toBe('Maria');

    // Search by last name
    const searchLast = db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, orgId),
          isNull(patients.deletedAt),
          or(like(patients.firstName, '%Mor%'), like(patients.lastName, '%Mor%')),
        ),
      )
      .all();
    expect(searchLast).toHaveLength(1);
    expect(searchLast[0].lastName).toBe('Morrison');
  });

  it('updates patient fields', () => {
    const patientId = uuidv4();

    db.insert(patients)
      .values({
        id: patientId,
        organizationId: orgId,
        firstName: 'James',
        lastName: 'Morrison',
        dateOfBirth: '1985-03-15',
        phone: '555-1234',
        createdBy: userId,
      })
      .run();

    db.update(patients)
      .set({ phone: '555-9999', preferredName: 'Jim' })
      .where(eq(patients.id, patientId))
      .run();

    const updated = db.select().from(patients).where(eq(patients.id, patientId)).get();
    expect(updated!.phone).toBe('555-9999');
    expect(updated!.preferredName).toBe('Jim');
  });
});
