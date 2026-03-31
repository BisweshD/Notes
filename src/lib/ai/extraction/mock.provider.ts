import type {
  ExtractionProvider,
  ExtractionResult,
  ExtractionType,
  ClinicalContext,
} from '../types';

/**
 * Mock extraction provider for development and testing.
 */
export class MockExtractionProvider implements ExtractionProvider {
  readonly name = 'mock';

  async extract(
    _transcript: string,
    extractionType: ExtractionType,
    _context?: ClinicalContext,
  ): Promise<ExtractionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const extractions: Record<ExtractionType, Record<string, unknown>> = {
      symptoms: {
        items: [
          { symptom: 'Depressed mood', severity: 'improving', change: 'better' },
          { symptom: 'Early morning awakening', severity: 'moderate', change: 'persistent' },
          { symptom: 'Low energy', severity: 'mild', change: 'persistent' },
          { symptom: 'Decreased libido', severity: 'mild', change: 'new (medication side effect)' },
        ],
      },
      medications: {
        current: [
          {
            name: 'Sertraline',
            dose: '100mg',
            frequency: 'daily',
            route: 'oral',
            adherence: 'good',
            sideEffects: ['decreased libido (mild)', 'nausea (resolved)'],
          },
        ],
        new: [
          {
            name: 'Trazodone',
            dose: '25mg',
            frequency: 'at bedtime',
            route: 'oral',
            indication: 'insomnia',
          },
        ],
      },
      diagnoses: {
        items: [
          { code: 'F33.1', description: 'Major depressive disorder, recurrent, moderate', status: 'active' },
          { code: 'G47.00', description: 'Insomnia disorder', status: 'active' },
        ],
      },
      risk_factors: {
        suicidal_ideation: false,
        homicidal_ideation: false,
        self_harm: false,
        risk_level: 'low',
        risk_factors: ['History of MDD', 'Ongoing sleep disturbance'],
        protective_factors: [
          'Medication compliance',
          'Therapeutic engagement',
          'Stable employment',
          'No SI history',
          'Positive treatment response',
        ],
      },
      mse: {
        appearance: 'Well-groomed, appropriate',
        behavior: 'Cooperative, good eye contact',
        speech: 'Normal rate, rhythm, volume',
        mood: 'Doing a bit better (6/10)',
        affect: 'Mood-congruent, reactive',
        thought_process: 'Linear, goal-directed',
        thought_content: 'No SI/HI, no delusions',
        perceptions: 'No hallucinations',
        cognition: 'Alert, oriented',
        insight: 'Good',
        judgment: 'Good',
      },
      plan_items: {
        items: [
          'Continue sertraline 100mg daily',
          'Start trazodone 25mg at bedtime',
          'Monitor trazodone side effects',
          'Follow up in 4 weeks',
        ],
      },
    };

    return {
      type: extractionType,
      data: extractions[extractionType],
      confidence: 0.88,
      sourceSegmentIndices: [],
    };
  }
}
