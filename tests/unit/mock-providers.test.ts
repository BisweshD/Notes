import { describe, it, expect } from 'vitest';
import { MockTranscriptionProvider } from '@/lib/ai/transcription/mock.provider';
import { MockNoteGenerationProvider } from '@/lib/ai/note-generation/mock.provider';
import { MockExtractionProvider } from '@/lib/ai/extraction/mock.provider';

describe('Mock Transcription Provider', () => {
  const provider = new MockTranscriptionProvider();

  it('has name "mock"', () => {
    expect(provider.name).toBe('mock');
  });

  it('returns a realistic transcript', async () => {
    const result = await provider.transcribe(Buffer.alloc(0));

    expect(result.segments.length).toBeGreaterThan(10);
    expect(result.fullText.length).toBeGreaterThan(100);
    expect(result.language).toBe('en');
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it('has segments with timestamps and speakers', async () => {
    const result = await provider.transcribe(Buffer.alloc(0));

    for (const segment of result.segments) {
      expect(segment.text.length).toBeGreaterThan(0);
      expect(segment.startTimeMs).toBeGreaterThanOrEqual(0);
      expect(segment.endTimeMs).toBeGreaterThan(segment.startTimeMs);
      expect(['clinician', 'patient']).toContain(segment.speaker);
      expect(segment.confidence).toBeGreaterThan(0);
    }
  });

  it('has ordered segments', async () => {
    const result = await provider.transcribe(Buffer.alloc(0));

    for (let i = 1; i < result.segments.length; i++) {
      expect(result.segments[i].startTimeMs).toBeGreaterThanOrEqual(
        result.segments[i - 1].startTimeMs,
      );
    }
  });
});

describe('Mock Note Generation Provider', () => {
  const provider = new MockNoteGenerationProvider();

  it('has name "mock"', () => {
    expect(provider.name).toBe('mock');
  });

  it('generates a single section', async () => {
    const result = await provider.generateSection(
      'chief_concern',
      'Chief Concern',
      'test transcript',
      [],
    );

    expect(result.sectionKey).toBe('chief_concern');
    expect(result.title).toBe('Chief Concern');
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('generates all sections', async () => {
    const sections = [
      { key: 'chief_concern', title: 'Chief Concern' },
      { key: 'assessment', title: 'Assessment' },
      { key: 'plan', title: 'Plan' },
    ];

    const results = await provider.generateAllSections(sections, 'test transcript', []);

    expect(results).toHaveLength(3);
    expect(results[0].sectionKey).toBe('chief_concern');
    expect(results[1].sectionKey).toBe('assessment');
    expect(results[2].sectionKey).toBe('plan');
  });

  it('generates content for known sections', async () => {
    const knownSections = [
      'chief_concern',
      'history_present_illness',
      'subjective',
      'mental_status_exam',
      'risk_assessment',
      'medications',
      'diagnoses',
      'assessment',
      'plan',
      'follow_up',
    ];

    for (const key of knownSections) {
      const result = await provider.generateSection(key, key, 'transcript', []);
      expect(result.content.length).toBeGreaterThan(10);
    }
  });
});

describe('Mock Extraction Provider', () => {
  const provider = new MockExtractionProvider();

  it('has name "mock"', () => {
    expect(provider.name).toBe('mock');
  });

  it('extracts symptoms', async () => {
    const result = await provider.extract('transcript', 'symptoms');
    expect(result.type).toBe('symptoms');
    expect(result.data).toHaveProperty('items');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('extracts medications', async () => {
    const result = await provider.extract('transcript', 'medications');
    expect(result.type).toBe('medications');
    expect(result.data).toHaveProperty('current');
    expect(result.data).toHaveProperty('new');
  });

  it('extracts risk factors', async () => {
    const result = await provider.extract('transcript', 'risk_factors');
    expect(result.type).toBe('risk_factors');
    expect(result.data).toHaveProperty('risk_level');
    expect(result.data).toHaveProperty('protective_factors');
  });

  it('extracts all supported types', async () => {
    const types = ['symptoms', 'medications', 'diagnoses', 'risk_factors', 'mse', 'plan_items'] as const;

    for (const type of types) {
      const result = await provider.extract('transcript', type);
      expect(result.type).toBe(type);
      expect(result.confidence).toBeGreaterThan(0);
    }
  });
});
