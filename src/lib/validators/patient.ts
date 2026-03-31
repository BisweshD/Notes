import { z } from 'zod/v4';

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  preferredName: z.string().max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  sex: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  genderIdentity: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.email().optional().or(z.literal('')),
  primaryLanguage: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
