import { requireAuth } from '@/lib/auth/session';
import { encounterService } from '@/lib/services/encounter.service';
import { notFound } from 'next/navigation';
import { EncounterWorkspace } from '@/components/encounters/encounter-workspace';

interface EncounterPageProps {
  params: Promise<{ patientId: string; encounterId: string }>;
}

export default async function EncounterPage({ params }: EncounterPageProps) {
  await requireAuth();
  const { patientId, encounterId } = await params;

  try {
    const encounter = encounterService.getEncounterWithPatient(encounterId);

    if (encounter.patientId !== patientId) {
      notFound();
    }

    const recordings = encounterService.getRecordings(encounterId);

    return (
      <EncounterWorkspace
        encounter={{
          id: encounter.id,
          patientId: encounter.patientId,
          clinicianId: encounter.clinicianId,
          organizationId: encounter.organizationId,
          encounterType: encounter.encounterType,
          status: encounter.status,
          scheduledAt: encounter.scheduledAt,
          startedAt: encounter.startedAt,
          endedAt: encounter.endedAt,
          durationSeconds: encounter.durationSeconds,
          chiefConcern: encounter.chiefConcern,
          location: encounter.location,
          isBillable: encounter.isBillable,
          metadata: encounter.metadata,
          createdAt: encounter.createdAt,
          updatedAt: encounter.updatedAt,
        }}
        patientName={`${encounter.patientFirstName} ${encounter.patientLastName}`}
        recordings={recordings}
      />
    );
  } catch {
    notFound();
  }
}
