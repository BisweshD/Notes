'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PatientList } from '@/components/patients/patient-list';
import { PatientForm } from '@/components/patients/patient-form';
import type { Patient } from '@/types/patient';

interface PatientsPageClientProps {
  patients: Patient[];
}

export function PatientsPageClient({ patients }: PatientsPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>
      <PatientList patients={patients} />
      <PatientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
