import type {
  NoteGenerationProvider,
  NoteSectionDraft,
  ExtractionResult,
  ClinicalContext,
} from '../types';

/**
 * Mock note generation provider for development and testing.
 * Returns realistic psychiatric note sections.
 */
export class MockNoteGenerationProvider implements NoteGenerationProvider {
  readonly name = 'mock';

  private readonly sectionContent: Record<string, string> = {
    chief_concern:
      'Follow-up for major depressive disorder, currently on sertraline 100mg.',

    history_present_illness:
      'Patient reports improvement in mood since starting sertraline, rating mood as 6/10 compared to 3-4/10 prior to treatment. Appetite has normalized. Energy remains low in afternoons. Work stress has improved after discussing workload with manager. However, patient reports persistent early morning awakening (3-4 AM) approximately 4 nights per week, with total sleep time of 5-6 hours (previously 7-8 hours). Nausea side effect has resolved. Reports mild decreased libido but not significantly bothersome.',

    subjective:
      'Mood: "Doing a bit better." Reports improvement with sertraline.\nSleep: Early morning awakening 3-4 AM, ~4 nights/week. Total sleep 5-6 hours.\nAppetite: Normalized.\nEnergy: Low in afternoons, feels need to nap around 2-3 PM.\nAnxiety: Improved after work situation was addressed.\nSide effects: Nausea resolved. Mild decreased libido, not bothersome.\nAdherence: Taking sertraline 100mg daily with breakfast, no missed doses.',

    mental_status_exam:
      'Appearance: Well-groomed, dressed appropriately, good hygiene.\nBehavior: Cooperative, good eye contact, engaged in conversation.\nSpeech: Normal rate, rhythm, and volume.\nMood: "Doing a bit better" — self-rated 6/10.\nAffect: Mood-congruent, reactive, mild restriction in range.\nThought Process: Linear, logical, goal-directed.\nThought Content: No suicidal ideation, no homicidal ideation, no delusions.\nPerceptions: No hallucinations reported.\nCognition: Alert, oriented, attentive.\nInsight: Good — recognizes improvement with medication.\nJudgment: Good — took proactive step to address work stress.',

    risk_assessment:
      'Suicidal ideation: Denied. Patient states "even when I was feeling really low, I never had those kinds of thoughts."\nHomicidal ideation: Denied.\nSelf-harm: Denied.\nRisk factors: History of MDD, ongoing sleep disturbance.\nProtective factors: Medication compliance, therapeutic engagement, social support (stable employment), no history of suicidal ideation, positive treatment response.\nOverall risk level: LOW.',

    medications:
      'Current medications:\n1. Sertraline 100mg PO daily — continuing, good adherence, positive response\n   Side effects: Mild decreased libido (tolerable), nausea resolved\n\nNew medication:\n2. Trazodone 25mg PO at bedtime — STARTING for insomnia (early morning awakening)\n   Instructed to take 30 minutes before bed',

    diagnoses:
      '1. Major Depressive Disorder, recurrent, moderate — IMPROVING on current treatment (F33.1)\n2. Insomnia disorder — persistent early morning awakening (G47.00)',

    assessment:
      'Patient with major depressive disorder showing partial response to sertraline 100mg. Mood has improved from 3-4/10 to 6/10, appetite normalized, work stress reduced. However, persistent early morning awakening is impacting total sleep and likely contributing to afternoon fatigue. Current medication should be continued at same dose given positive trajectory. Sleep disturbance warrants pharmacological intervention with low-dose trazodone.',

    plan:
      '1. Continue sertraline 100mg PO daily\n2. Start trazodone 25mg PO at bedtime for insomnia\n3. Monitor for side effects of trazodone at next visit\n4. Continue current therapy approach\n5. Follow up in 4 weeks to assess sleep improvement and overall mood trajectory\n6. Patient to call if any concerns arise before follow-up',

    follow_up:
      'Follow-up appointment in 4 weeks. Patient instructed to call with any concerns or side effects from new medication.',
  };

  async generateSection(
    sectionKey: string,
    sectionTitle: string,
    _transcript: string,
    _extractions: ExtractionResult[],
    _context?: ClinicalContext,
  ): Promise<NoteSectionDraft> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      sectionKey,
      title: sectionTitle,
      content: this.sectionContent[sectionKey] || `[AI-generated content for ${sectionTitle}]`,
      confidence: 0.85 + Math.random() * 0.1,
      sourceSegmentIndices: [],
    };
  }

  async generateAllSections(
    sections: Array<{ key: string; title: string }>,
    transcript: string,
    extractions: ExtractionResult[],
    context?: ClinicalContext,
  ): Promise<NoteSectionDraft[]> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return sections.map((section) => ({
      sectionKey: section.key,
      title: section.title,
      content:
        this.sectionContent[section.key] || `[AI-generated content for ${section.title}]`,
      confidence: 0.85 + Math.random() * 0.1,
      sourceSegmentIndices: [],
    }));
  }
}
