'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';
import { NewEncounterDialog } from '@/components/encounters/new-encounter-dialog';

interface PatientEncountersTabProps {
  patientId: string;
  encounters: Array<{
    id: string;
    encounterType: string;
    status: string;
    chiefConcern: string | null;
    scheduledAt: string | null;
    createdAt: string;
  }>;
}

const encounterTypeLabels: Record<string, string> = {
  initial_evaluation: 'Initial Evaluation',
  follow_up: 'Follow-Up',
  med_management: 'Medication Management',
  therapy: 'Psychotherapy',
  urgent: 'Urgent Visit',
  telehealth: 'Telehealth',
};

const encounterStatusStyles: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  recording: 'bg-red-50 text-red-700 border-red-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  review: 'bg-orange-50 text-orange-700 border-orange-200',
  signed: 'bg-green-50 text-green-700 border-green-200',
  amended: 'bg-teal-50 text-teal-700 border-teal-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
};

export function PatientEncountersTab({ patientId, encounters }: PatientEncountersTabProps) {
  const [showNewEncounter, setShowNewEncounter] = useState(false);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowNewEncounter(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Encounter
        </Button>
      </div>

      {encounters.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium">No encounters yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a new encounter to begin documenting.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {encounters.map((enc) => (
            <Link
              key={enc.id}
              href={`/patients/${patientId}/encounters/${enc.id}`}
              className="block"
            >
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium">
                      {encounterTypeLabels[enc.encounterType] || enc.encounterType}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {enc.chiefConcern || 'No chief concern'}
                      {' · '}
                      {enc.scheduledAt
                        ? new Date(enc.scheduledAt).toLocaleDateString()
                        : new Date(enc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${encounterStatusStyles[enc.status] || ''}`}
                  >
                    {enc.status.charAt(0).toUpperCase() + enc.status.slice(1).replace('_', ' ')}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NewEncounterDialog
        patientId={patientId}
        open={showNewEncounter}
        onOpenChange={setShowNewEncounter}
      />
    </div>
  );
}
