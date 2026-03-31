import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq, and, or, like, isNull } from 'drizzle-orm';
import type { CreatePatientInput, UpdatePatientInput } from '@/lib/validators/patient';

export const patientRepository = {
  findAll(organizationId: string, options?: { search?: string; status?: string }) {
    const db = getDb();
    const conditions = [
      eq(patients.organizationId, organizationId),
      isNull(patients.deletedAt),
    ];

    if (options?.status) {
      conditions.push(eq(patients.status, options.status));
    }

    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          like(patients.firstName, searchTerm),
          like(patients.lastName, searchTerm),
        )!,
      );
    }

    return db
      .select()
      .from(patients)
      .where(and(...conditions))
      .orderBy(patients.lastName)
      .all();
  },

  findById(id: string) {
    const db = getDb();
    return db.select().from(patients).where(eq(patients.id, id)).get();
  },

  create(data: CreatePatientInput & { organizationId: string; createdBy: string }) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const record = {
      id,
      organizationId: data.organizationId,
      firstName: data.firstName,
      lastName: data.lastName,
      preferredName: data.preferredName ?? null,
      dateOfBirth: data.dateOfBirth,
      sex: data.sex ?? null,
      genderIdentity: data.genderIdentity ?? null,
      pronouns: data.pronouns ?? null,
      phone: data.phone ?? null,
      email: data.email || null,
      primaryLanguage: data.primaryLanguage ?? null,
      notes: data.notes ?? null,
      status: 'active' as const,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(patients).values(record).run();
    return this.findById(id)!;
  },

  update(id: string, data: UpdatePatientInput) {
    const db = getDb();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.preferredName !== undefined) updateData.preferredName = data.preferredName ?? null;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
    if (data.sex !== undefined) updateData.sex = data.sex ?? null;
    if (data.genderIdentity !== undefined) updateData.genderIdentity = data.genderIdentity ?? null;
    if (data.pronouns !== undefined) updateData.pronouns = data.pronouns ?? null;
    if (data.phone !== undefined) updateData.phone = data.phone ?? null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.primaryLanguage !== undefined) updateData.primaryLanguage = data.primaryLanguage ?? null;
    if (data.notes !== undefined) updateData.notes = data.notes ?? null;

    db.update(patients).set(updateData).where(eq(patients.id, id)).run();
    return this.findById(id)!;
  },

  softDelete(id: string) {
    const db = getDb();
    const now = new Date().toISOString();
    db.update(patients)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(patients.id, id))
      .run();
  },
};
