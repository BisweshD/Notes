export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  dateOfBirth: string;
  sex?: string | null;
  genderIdentity?: string | null;
  pronouns?: string | null;
  phone?: string | null;
  email?: string | null;
  primaryLanguage?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
