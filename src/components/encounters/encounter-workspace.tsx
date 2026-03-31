'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mic,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { EncounterStatusBadge } from './encounter-status-badge';
import { RecordingControls } from '@/components/recording/recording-controls';
import { RecordingTimer } from '@/components/recording/recording-timer';
import {
  startRecordingAction,
  stopRecordingAction,
  transitionEncounterAction,
} from '@/actions/encounter.actions';
import { ENCOUNTER_TYPE_LABELS } from '@/lib/constants';
import type { Encounter } from '@/types/encounter';

interface EncounterWorkspaceProps {
  encounter: Encounter;
  patientName: string;
  recordings: Array<{
    id: string;
    status: string | null;
    startedAt: string;
    endedAt: string | null;
    durationSeconds: number | null;
  }>;
}

export function EncounterWorkspace({
  encounter: initialEncounter,
  patientName,
  recordings: initialRecordings,
}: EncounterWorkspaceProps) {
  const router = useRouter();
  const [encounter, setEncounter] = useState(initialEncounter);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(
    initialRecordings.find((r) => r.status === 'recording')?.id ?? null,
  );
  const [isRecording, setIsRecording] = useState(encounter.status === 'recording');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = useCallback(async () => {
    setIsProcessing(true);
    try {
      const result = await startRecordingAction(encounter.id);
      if (result.success) {
        setEncounter(result.encounter!);
        setCurrentRecordingId(result.recording!.id);
        setIsRecording(true);
        toast.success('Recording started');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to start recording');
    } finally {
      setIsProcessing(false);
    }
  }, [encounter.id]);

  const handleStopRecording = useCallback(async () => {
    if (!currentRecordingId) return;
    setIsProcessing(true);
    try {
      const result = await stopRecordingAction(encounter.id, currentRecordingId);
      if (result.success) {
        setEncounter(result.encounter!);
        setCurrentRecordingId(null);
        setIsRecording(false);
        toast.success('Recording stopped. Processing encounter...');

        // Trigger processing pipeline
        try {
          const processResult = await fetch(
            `/api/encounters/${encounter.id}/process`,
            { method: 'POST' },
          );
          const processData = await processResult.json();
          if (processData.success) {
            toast.success('Note generated! Ready for review.');
          } else {
            toast.error('Processing had issues. You can still review.');
          }
        } catch {
          toast.error('Processing encountered an error');
        }

        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to stop recording');
    } finally {
      setIsProcessing(false);
    }
  }, [encounter.id, currentRecordingId, router]);

  const handleTransition = useCallback(
    async (newStatus: string) => {
      setIsProcessing(true);
      try {
        const result = await transitionEncounterAction(
          encounter.id,
          newStatus as 'scheduled' | 'in_progress' | 'recording' | 'processing' | 'review' | 'signed' | 'amended' | 'cancelled',
        );
        if (result.success) {
          setEncounter(result.encounter!);
          toast.success(`Status updated to ${newStatus}`);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Failed to update status');
      } finally {
        setIsProcessing(false);
      }
    },
    [encounter.id, router],
  );

  const encounterTypeLabel =
    ENCOUNTER_TYPE_LABELS[encounter.encounterType as keyof typeof ENCOUNTER_TYPE_LABELS] ||
    encounter.encounterType;

  const showRecordingUI = ['scheduled', 'in_progress', 'recording'].includes(encounter.status);
  const showProcessingUI = encounter.status === 'processing';
  const showReviewLink = ['review', 'signed', 'amended'].includes(encounter.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${encounter.patientId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{patientName}</h1>
              <EncounterStatusBadge status={encounter.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {encounterTypeLabel}
              {encounter.chiefConcern && ` — ${encounter.chiefConcern}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showReviewLink && (
            <Link
              href={`/patients/${encounter.patientId}/encounters/${encounter.id}/review`}
            >
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                {encounter.status === 'signed' ? 'View Note' : 'Review Note'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Separator />

      {/* Recording Section */}
      {showRecordingUI && (
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {isRecording ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  Recording in Progress
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Ready to Record
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isRecording && (
              <div className="flex justify-center">
                <RecordingTimer startedAt={encounter.startedAt || new Date().toISOString()} />
              </div>
            )}

            <RecordingControls
              isRecording={isRecording}
              isProcessing={isProcessing}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
            />

            {!isRecording && encounter.status === 'scheduled' && (
              <p className="text-center text-sm text-muted-foreground">
                Press the record button to begin capturing the session.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing state */}
      {showProcessingUI && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">Processing encounter...</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transcribing audio and generating clinical note
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransition('review')}
                disabled={isProcessing}
              >
                Skip to Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encounter Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{encounterTypeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>{encounter.location === 'telehealth' ? 'Telehealth' : 'In Person'}</span>
            </div>
            {encounter.scheduledAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled</span>
                <span>{new Date(encounter.scheduledAt).toLocaleString()}</span>
              </div>
            )}
            {encounter.startedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span>{new Date(encounter.startedAt).toLocaleString()}</span>
              </div>
            )}
            {encounter.endedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ended</span>
                <span>{new Date(encounter.endedAt).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chief Concern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {encounter.chiefConcern || 'No chief concern documented'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
