/**
 * Core types for AI provider abstraction layer.
 * All providers implement these interfaces for swappability.
 */

// ---- Transcription ----

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
}

export interface TranscriptSegment {
  text: string;
  startTimeMs: number;
  endTimeMs: number;
  speaker?: string;
  confidence?: number;
}

export interface TranscriptionResult {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
  durationMs: number;
}

export interface TranscriptionProvider {
  readonly name: string;
  transcribe(audio: Buffer, options?: TranscriptionOptions): Promise<TranscriptionResult>;
}

// ---- Diarization ----

export interface DiarizationResult {
  segments: Array<{
    speaker: string;
    startTimeMs: number;
    endTimeMs: number;
  }>;
}

export interface DiarizationProvider {
  readonly name: string;
  diarize(audio: Buffer, transcript: TranscriptionResult): Promise<DiarizationResult>;
}

// ---- Clinical Extraction ----

export type ExtractionType =
  | 'symptoms'
  | 'medications'
  | 'diagnoses'
  | 'risk_factors'
  | 'mse'
  | 'plan_items';

export interface ExtractionResult {
  type: ExtractionType;
  data: Record<string, unknown>;
  confidence: number;
  sourceSegmentIndices: number[];
}

export interface ClinicalContext {
  patientId: string;
  encounterType: string;
  chiefConcern?: string;
  previousDiagnoses?: string[];
  currentMedications?: string[];
}

export interface ExtractionProvider {
  readonly name: string;
  extract(
    transcript: string,
    extractionType: ExtractionType,
    context?: ClinicalContext,
  ): Promise<ExtractionResult>;
}

// ---- Note Generation ----

export interface NoteSectionDraft {
  sectionKey: string;
  title: string;
  content: string;
  confidence: number;
  sourceSegmentIndices: number[];
}

export interface NoteGenerationProvider {
  readonly name: string;
  generateSection(
    sectionKey: string,
    sectionTitle: string,
    transcript: string,
    extractions: ExtractionResult[],
    context?: ClinicalContext,
  ): Promise<NoteSectionDraft>;

  generateAllSections(
    sections: Array<{ key: string; title: string }>,
    transcript: string,
    extractions: ExtractionResult[],
    context?: ClinicalContext,
  ): Promise<NoteSectionDraft[]>;
}
