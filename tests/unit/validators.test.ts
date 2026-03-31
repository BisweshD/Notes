import { describe, it, expect } from 'vitest';
import { createPatientSchema } from '@/lib/validators/patient';
import { createEncounterSchema } from '@/lib/validators/encounter';

describe('Patient Validator', () => {
  it('accepts valid patient data', () => {
    const result = createPatientSchema.safeParse({
      firstName: 'James',
      lastName: 'Morrison',
      dateOfBirth: '1985-03-15',
      sex: 'male',
      phone: '555-1234',
    });
    expect(result.success).toBe(true);
  });

  it('requires firstName', () => {
    const result = createPatientSchema.safeParse({
      lastName: 'Morrison',
      dateOfBirth: '1985-03-15',
    });
    expect(result.success).toBe(false);
  });

  it('requires lastName', () => {
    const result = createPatientSchema.safeParse({
      firstName: 'James',
      dateOfBirth: '1985-03-15',
    });
    expect(result.success).toBe(false);
  });

  it('requires dateOfBirth', () => {
    const result = createPatientSchema.safeParse({
      firstName: 'James',
      lastName: 'Morrison',
    });
    expect(result.success).toBe(false);
  });

  it('validates dateOfBirth format', () => {
    const result = createPatientSchema.safeParse({
      firstName: 'James',
      lastName: 'Morrison',
      dateOfBirth: 'March 15 1985',
    });
    expect(result.success).toBe(false);
  });

  it('validates sex enum', () => {
    const result = createPatientSchema.safeParse({
      firstName: 'James',
      lastName: 'Morrison',
      dateOfBirth: '1985-03-15',
      sex: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = createPatientSchema.safeParse({
      firstName: 'James',
      lastName: 'Morrison',
      dateOfBirth: '1985-03-15',
      preferredName: 'Jim',
      pronouns: 'he/him',
      notes: 'Some notes',
    });
    expect(result.success).toBe(true);
  });
});

describe('Encounter Validator', () => {
  it('accepts valid encounter data', () => {
    const result = createEncounterSchema.safeParse({
      patientId: '123',
      encounterType: 'follow_up',
    });
    expect(result.success).toBe(true);
  });

  it('requires patientId', () => {
    const result = createEncounterSchema.safeParse({
      encounterType: 'follow_up',
    });
    expect(result.success).toBe(false);
  });

  it('requires encounterType', () => {
    const result = createEncounterSchema.safeParse({
      patientId: '123',
    });
    expect(result.success).toBe(false);
  });

  it('validates encounterType enum', () => {
    const result = createEncounterSchema.safeParse({
      patientId: '123',
      encounterType: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid encounter types', () => {
    const types = [
      'initial_evaluation',
      'follow_up',
      'med_management',
      'therapy',
      'urgent',
      'telehealth',
    ];

    for (const type of types) {
      const result = createEncounterSchema.safeParse({
        patientId: '123',
        encounterType: type,
      });
      expect(result.success).toBe(true);
    }
  });

  it('validates location enum', () => {
    const result = createEncounterSchema.safeParse({
      patientId: '123',
      encounterType: 'follow_up',
      location: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid location values', () => {
    for (const location of ['in_person', 'telehealth']) {
      const result = createEncounterSchema.safeParse({
        patientId: '123',
        encounterType: 'follow_up',
        location,
      });
      expect(result.success).toBe(true);
    }
  });
});
