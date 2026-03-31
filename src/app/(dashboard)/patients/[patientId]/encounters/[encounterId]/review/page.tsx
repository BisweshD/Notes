import { requireAuth } from '@/lib/auth/session';
import { encounterService } from '@/lib/services/encounter.service';
import { noteRepository } from '@/lib/repositories/note.repository';
import { transcriptRepository } from '@/lib/repositories/transcript.repository';
import { notFound } from 'next/navigation';
import { NoteReviewWorkspace } from '@/components/notes/note-review-workspace';

interface ReviewPageProps {
  params: Promise<{ patientId: string; encounterId: string }>;
}

export default async function NoteReviewPage({ params }: ReviewPageProps) {
  await requireAuth();
  const { patientId, encounterId } = await params;

  let encounter;
  try {
    encounter = encounterService.getEncounterWithPatient(encounterId);
    if (encounter.patientId !== patientId) {
      notFound();
    }
  } catch {
    notFound();
  }

  // Get note and sections
  const note = noteRepository.findNoteByEncounter(encounterId);
  const sections = note ? noteRepository.findSectionsByNote(note.id) : [];
  const transcriptSegments = transcriptRepository.findByEncounter(encounterId);

  return (
    <NoteReviewWorkspace
      encounter={{
        id: encounter.id,
        patientId: encounter.patientId,
        encounterType: encounter.encounterType,
        status: encounter.status,
        chiefConcern: encounter.chiefConcern,
      }}
      patientName={`${encounter.patientFirstName} ${encounter.patientLastName}`}
      note={
        note
          ? {
              id: note.id,
              status: note.status,
              version: note.version,
              isLocked: note.isLocked ?? false,
              signedAt: note.signedAt,
            }
          : null
      }
      sections={sections.map((s) => ({
        id: s.id,
        sectionKey: s.sectionKey,
        title: s.title,
        content: s.content,
        sortOrder: s.sortOrder,
        source: s.source,
        aiConfidence: s.aiConfidence,
        isApproved: s.isApproved ?? false,
      }))}
      transcriptSegments={transcriptSegments.map((seg) => ({
        id: seg.id,
        segmentIndex: seg.segmentIndex,
        speaker: seg.speaker,
        startTimeMs: seg.startTimeMs,
        endTimeMs: seg.endTimeMs,
        text: seg.text,
        confidence: seg.confidence,
      }))}
    />
  );
}
