'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  FileSignature,
  Lock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { EncounterStatusBadge } from '@/components/encounters/encounter-status-badge';
import { NoteSection } from './note-section';
import { TranscriptPanel } from './transcript-panel';
import { signNoteAction } from '@/actions/note.actions';
import { ENCOUNTER_TYPE_LABELS } from '@/lib/constants';

interface NoteReviewWorkspaceProps {
  encounter: {
    id: string;
    patientId: string;
    encounterType: string;
    status: string;
    chiefConcern?: string | null;
  };
  patientName: string;
  note: {
    id: string;
    status: string;
    version: number;
    isLocked: boolean;
    signedAt?: string | null;
  } | null;
  sections: Array<{
    id: string;
    sectionKey: string;
    title: string;
    content: string;
    sortOrder: number;
    source: string;
    aiConfidence: number | null;
    isApproved: boolean;
  }>;
  transcriptSegments: Array<{
    id: string;
    segmentIndex: number;
    speaker: string | null;
    startTimeMs: number;
    endTimeMs: number;
    text: string;
    confidence: number | null;
  }>;
}

export function NoteReviewWorkspace({
  encounter,
  patientName,
  note,
  sections: initialSections,
  transcriptSegments,
}: NoteReviewWorkspaceProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [activeSegmentId] = useState<string | null>(null);

  const isLocked = note?.isLocked ?? false;
  const isSigned = note?.status === 'signed';

  const encounterTypeLabel =
    ENCOUNTER_TYPE_LABELS[encounter.encounterType as keyof typeof ENCOUNTER_TYPE_LABELS] ||
    encounter.encounterType;

  const approvedCount = sections.filter((s) => s.isApproved).length;
  const totalSections = sections.length;

  const handleSectionApproved = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isApproved: true } : s)),
    );
  }, []);

  const handleSectionUpdated = useCallback(
    (sectionId: string, content: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, content, source: 'ai_edited' } : s,
        ),
      );
    },
    [],
  );

  const handleSign = useCallback(async () => {
    if (!note) return;
    setIsSigning(true);
    try {
      const result = await signNoteAction(note.id);
      if (result.success) {
        toast.success('Note signed and finalized');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to sign note');
    } finally {
      setIsSigning(false);
      setShowSignDialog(false);
    }
  }, [note, router]);

  if (!note) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Note Review</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No note has been generated for this encounter yet.
            </p>
            <Link href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}>
              <Button variant="outline" className="mt-4">
                Return to Encounter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{patientName}</h1>
              <EncounterStatusBadge status={encounter.status} />
              {isSigned && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Signed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {encounterTypeLabel} — Note Review
              {approvedCount > 0 && ` (${approvedCount}/${totalSections} sections approved)`}
            </p>
          </div>
        </div>

        {!isSigned && (
          <Button
            onClick={() => setShowSignDialog(true)}
            className="gap-2"
            disabled={isSigning}
          >
            <FileSignature className="h-4 w-4" />
            Sign & Finalize
          </Button>
        )}
      </div>

      <Separator />

      {/* Split Pane: Note Sections (left) + Transcript (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[calc(100vh-14rem)]">
        {/* Note Sections - Left Panel */}
        <div className="lg:col-span-3">
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-4 pr-4">
              {sections.map((section) => (
                <NoteSection
                  key={section.id}
                  section={section}
                  isLocked={isLocked}
                  onApproved={handleSectionApproved}
                  onUpdated={handleSectionUpdated}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Transcript - Right Panel */}
        <div className="lg:col-span-2">
          <TranscriptPanel
            segments={transcriptSegments}
            activeSegmentId={activeSegmentId}
          />
        </div>
      </div>

      {/* Sign Confirmation Dialog */}
      <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign and Finalize Note</AlertDialogTitle>
            <AlertDialogDescription>
              By signing this note, you are confirming that the documentation is accurate
              and complete. Once signed, the note will be locked and cannot be edited.
              {approvedCount < totalSections && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Note: {totalSections - approvedCount} section(s) have not been
                  individually approved.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSigning}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSign} disabled={isSigning}>
              {isSigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Sign Note
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
