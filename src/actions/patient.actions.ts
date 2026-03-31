'use server';

import { requireAuth } from '@/lib/auth/session';
import { patientService } from '@/lib/services/patient.service';
import { isAppError } from '@/lib/errors';

type SexValue = 'male' | 'female' | 'other' | 'unknown';
const validSexValues = new Set<string>(['male', 'female', 'other', 'unknown']);

function extractPatientFields(formData: FormData) {
  const rawSex = (formData.get('sex') as string) || undefined;
  const sex = rawSex && validSexValues.has(rawSex) ? (rawSex as SexValue) : undefined;

  return {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    preferredName: (formData.get('preferredName') as string) || undefined,
    dateOfBirth: formData.get('dateOfBirth') as string,
    sex,
    genderIdentity: (formData.get('genderIdentity') as string) || undefined,
    pronouns: (formData.get('pronouns') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    primaryLanguage: (formData.get('primaryLanguage') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  };
}

export async function createPatientAction(formData: FormData) {
  try {
    const session = await requireAuth();
    const fields = extractPatientFields(formData);
    const patient = patientService.createPatient(
      fields,
      session.id,
      session.organizationId,
    );
    return { success: true as const, patient };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false as const, error: error.message };
    }
    return { success: false as const, error: 'An unexpected error occurred' };
  }
}

export async function updatePatientAction(id: string, formData: FormData) {
  try {
    await requireAuth();
    const fields = extractPatientFields(formData);
    const patient = patientService.updatePatient(id, fields);
    return { success: true as const, patient };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false as const, error: error.message };
    }
    return { success: false as const, error: 'An unexpected error occurred' };
  }
}

export async function deletePatientAction(id: string) {
  try {
    await requireAuth();
    patientService.deletePatient(id);
    return { success: true as const };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false as const, error: error.message };
    }
    return { success: false as const, error: 'An unexpected error occurred' };
  }
}

export async function searchPatientsAction(query: string) {
  try {
    const session = await requireAuth();
    const patients = patientService.listPatients(session.organizationId, { search: query });
    return { success: true as const, patients };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false as const, error: error.message };
    }
    return { success: false as const, error: 'An unexpected error occurred' };
  }
}
