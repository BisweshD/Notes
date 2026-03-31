import { getTranscriptionProvider, getNoteGenerationProvider } from '@/lib/ai/provider-registry';
import { transcriptRepository } from '@/lib/repositories/transcript.repository';
import { noteRepository } from '@/lib/repositories/note.repository';
import { encounterRepository } from '@/lib/repositories/encounter.repository';
import { processingJobRepository } from '@/lib/repositories/processing-job.repository';

/**
 * Encounter processing pipeline.
 * Orchestrates transcription → extraction → note generation.
 */
export async function processEncounter(encounterId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const encounter = encounterRepository.findById(encounterId);
    if (!encounter) {
      return { success: false, error: 'Encounter not found' };
    }

    // Step 1: Transcription
    const transcriptionResult = await runTranscription(encounterId);
    if (!transcriptionResult.success) {
      return { success: false, error: `Transcription failed: ${transcriptionResult.error}` };
    }

    // Step 2: Note Generation
    const noteResult = await runNoteGeneration(encounterId, encounter.encounterType);
    if (!noteResult.success) {
      return { success: false, error: `Note generation failed: ${noteResult.error}` };
    }

    // Transition encounter to review
    encounterRepository.updateStatus(encounterId, 'review');

    return { success: true };
  } catch (error) {
    console.error('Pipeline error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown pipeline error',
    };
  }
}

async function runTranscription(encounterId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const job = processingJobRepository.create(encounterId, 'transcription');

  try {
    processingJobRepository.updateStatus(job.id, 'in_progress', {
      startedAt: new Date().toISOString(),
    });
    processingJobRepository.incrementAttempts(job.id);

    const provider = getTranscriptionProvider();

    // Get the audio file (or use empty buffer for mock)
    const recordings = encounterRepository.findRecordingsByEncounter(encounterId);
    const latestRecording = recordings[recordings.length - 1];
    const audioBuffer = Buffer.alloc(0); // Mock doesn't need real audio

    const result = await provider.transcribe(audioBuffer, {
      prompt: 'Psychiatric clinical encounter between doctor and patient',
    });

    // Store transcript segments
    const recordingId = latestRecording?.id || encounterId;
    transcriptRepository.storeSegments(encounterId, recordingId, result.segments);

    processingJobRepository.updateStatus(job.id, 'completed', {
      provider: provider.name,
      completedAt: new Date().toISOString(),
      outputData: JSON.stringify({
        segmentCount: result.segments.length,
        durationMs: result.durationMs,
        language: result.language,
      }),
    });

    return { success: true };
  } catch (error) {
    processingJobRepository.updateStatus(job.id, 'failed', {
      errorMessage: error instanceof Error ? error.message : 'Transcription failed',
      completedAt: new Date().toISOString(),
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function runNoteGeneration(
  encounterId: string,
  encounterType: string,
): Promise<{ success: boolean; error?: string }> {
  const job = processingJobRepository.create(encounterId, 'note_generation');

  try {
    processingJobRepository.updateStatus(job.id, 'in_progress', {
      startedAt: new Date().toISOString(),
    });
    processingJobRepository.incrementAttempts(job.id);

    const provider = getNoteGenerationProvider();

    // Get transcript
    const transcript = transcriptRepository.getFullText(encounterId);
    if (!transcript) {
      throw new Error('No transcript available for note generation');
    }

    // Get note template
    const template = noteRepository.findTemplateByType(encounterType);
    const sections = template
      ? (JSON.parse(template.sections) as Array<{ key: string; title: string }>)
      : getDefaultSections();

    // Generate all note sections
    const drafts = await provider.generateAllSections(sections, transcript, []);

    // Create note and sections
    const note = noteRepository.createNote({
      encounterId,
      templateId: template?.id,
      status: 'ai_generated',
    });

    noteRepository.createSections(note.id, drafts);

    processingJobRepository.updateStatus(job.id, 'completed', {
      provider: provider.name,
      completedAt: new Date().toISOString(),
      outputData: JSON.stringify({
        noteId: note.id,
        sectionCount: drafts.length,
      }),
    });

    return { success: true };
  } catch (error) {
    processingJobRepository.updateStatus(job.id, 'failed', {
      errorMessage: error instanceof Error ? error.message : 'Note generation failed',
      completedAt: new Date().toISOString(),
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function getDefaultSections(): Array<{ key: string; title: string }> {
  return [
    { key: 'chief_concern', title: 'Chief Concern' },
    { key: 'history_present_illness', title: 'History of Present Illness' },
    { key: 'subjective', title: 'Subjective' },
    { key: 'mental_status_exam', title: 'Mental Status Exam' },
    { key: 'risk_assessment', title: 'Risk Assessment' },
    { key: 'medications', title: 'Medications & Adherence' },
    { key: 'diagnoses', title: 'Diagnoses' },
    { key: 'assessment', title: 'Assessment' },
    { key: 'plan', title: 'Plan' },
    { key: 'follow_up', title: 'Follow-Up' },
  ];
}
