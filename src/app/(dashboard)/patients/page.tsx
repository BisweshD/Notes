import { requireAuth } from '@/lib/auth/session';
import { patientService } from '@/lib/services/patient.service';
import { PageHeader } from '@/components/layout/page-header';
import { PatientsPageClient } from './patients-page-client';

export default async function PatientsPage() {
  const session = await requireAuth();
  const allPatients = patientService.listPatients(session.organizationId);

  const patients = allPatients.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    preferredName: p.preferredName,
    dateOfBirth: p.dateOfBirth,
    sex: p.sex,
    genderIdentity: p.genderIdentity,
    pronouns: p.pronouns,
    phone: p.phone,
    email: p.email,
    primaryLanguage: p.primaryLanguage,
    status: p.status,
    notes: p.notes,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage your patient roster."
      />
      <PatientsPageClient patients={patients} />
    </div>
  );
}
