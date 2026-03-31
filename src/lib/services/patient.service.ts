import { patientRepository } from '@/lib/repositories/patient.repository';
import { createPatientSchema, updatePatientSchema } from '@/lib/validators/patient';
import type { CreatePatientInput, UpdatePatientInput } from '@/lib/validators/patient';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const patientService = {
  listPatients(organizationId: string, options?: { search?: string; status?: string }) {
    return patientRepository.findAll(organizationId, options);
  },

  getPatient(id: string) {
    const patient = patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }
    return patient;
  },

  createPatient(input: CreatePatientInput, userId: string, organizationId: string) {
    const result = createPatientSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError('Invalid patient data', result.error.issues);
    }

    return patientRepository.create({
      ...result.data,
      createdBy: userId,
      organizationId,
    });
  },

  updatePatient(id: string, input: UpdatePatientInput) {
    const existing = patientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient', id);
    }

    const result = updatePatientSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError('Invalid patient data', result.error.issues);
    }

    return patientRepository.update(id, result.data);
  },

  deletePatient(id: string) {
    const existing = patientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient', id);
    }

    patientRepository.softDelete(id);
  },
};
