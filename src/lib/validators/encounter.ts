import { z } from 'zod/v4';

export const createEncounterSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  encounterType: z.enum([
    'initial_evaluation',
    'follow_up',
    'med_management',
    'therapy',
    'urgent',
    'telehealth',
  ]),
  scheduledAt: z.string().optional(),
  chiefConcern: z.string().max(500).optional(),
  location: z.enum(['in_person', 'telehealth']).optional(),
});

export const updateEncounterSchema = z.object({
  chiefConcern: z.string().max(500).optional(),
  location: z.enum(['in_person', 'telehealth']).optional(),
  encounterType: z
    .enum([
      'initial_evaluation',
      'follow_up',
      'med_management',
      'therapy',
      'urgent',
      'telehealth',
    ])
    .optional(),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
