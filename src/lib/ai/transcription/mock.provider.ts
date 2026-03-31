import type {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionOptions,
} from '../types';

/**
 * Mock transcription provider for development and testing.
 * Returns a realistic psychiatric encounter transcript.
 */
export class MockTranscriptionProvider implements TranscriptionProvider {
  readonly name = 'mock';

  async transcribe(
    _audio: Buffer,
    _options?: TranscriptionOptions,
  ): Promise<TranscriptionResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const segments = [
      {
        text: "Good morning. How have you been since our last visit?",
        startTimeMs: 0,
        endTimeMs: 4000,
        speaker: 'clinician',
        confidence: 0.95,
      },
      {
        text: "Hi doctor. Overall I've been doing a bit better, I think. The sertraline seems to be helping with my mood.",
        startTimeMs: 4500,
        endTimeMs: 11000,
        speaker: 'patient',
        confidence: 0.92,
      },
      {
        text: "That's good to hear. How would you rate your mood on a scale of one to ten?",
        startTimeMs: 11500,
        endTimeMs: 15000,
        speaker: 'clinician',
        confidence: 0.94,
      },
      {
        text: "I'd say about a six. Before I started the medication it was probably a three or four. So definitely better.",
        startTimeMs: 15500,
        endTimeMs: 22000,
        speaker: 'patient',
        confidence: 0.91,
      },
      {
        text: "How about your sleep? Last time you mentioned having difficulty falling asleep.",
        startTimeMs: 22500,
        endTimeMs: 27000,
        speaker: 'clinician',
        confidence: 0.93,
      },
      {
        text: "Sleep is still a little tough. I'm falling asleep okay now, but I wake up around three or four AM and can't get back to sleep. Maybe four nights a week.",
        startTimeMs: 27500,
        endTimeMs: 36000,
        speaker: 'patient',
        confidence: 0.89,
      },
      {
        text: "Early morning awakening. Are you getting enough total hours of sleep?",
        startTimeMs: 36500,
        endTimeMs: 40000,
        speaker: 'clinician',
        confidence: 0.94,
      },
      {
        text: "About five or six hours most nights. I used to get seven or eight.",
        startTimeMs: 40500,
        endTimeMs: 44000,
        speaker: 'patient',
        confidence: 0.92,
      },
      {
        text: "And your appetite? Energy levels?",
        startTimeMs: 44500,
        endTimeMs: 47000,
        speaker: 'clinician',
        confidence: 0.95,
      },
      {
        text: "Appetite is back to normal, which is great. Energy is still low in the afternoons. I sometimes feel like I need a nap around two or three PM.",
        startTimeMs: 47500,
        endTimeMs: 55000,
        speaker: 'patient',
        confidence: 0.90,
      },
      {
        text: "Any side effects from the sertraline? Nausea, headaches, sexual side effects?",
        startTimeMs: 55500,
        endTimeMs: 60000,
        speaker: 'clinician',
        confidence: 0.94,
      },
      {
        text: "The nausea went away after the first couple of weeks. No headaches. I have noticed some decreased libido but it's not too bothersome.",
        startTimeMs: 60500,
        endTimeMs: 69000,
        speaker: 'patient',
        confidence: 0.88,
      },
      {
        text: "I appreciate you sharing that. Are you still taking it every morning as prescribed? The hundred milligrams?",
        startTimeMs: 69500,
        endTimeMs: 75000,
        speaker: 'clinician',
        confidence: 0.93,
      },
      {
        text: "Yes, every morning with breakfast. I haven't missed any doses.",
        startTimeMs: 75500,
        endTimeMs: 79000,
        speaker: 'patient',
        confidence: 0.95,
      },
      {
        text: "Have you had any thoughts of harming yourself or not wanting to be alive?",
        startTimeMs: 80000,
        endTimeMs: 84000,
        speaker: 'clinician',
        confidence: 0.96,
      },
      {
        text: "No, nothing like that. Even when I was feeling really low, I never had those kinds of thoughts.",
        startTimeMs: 84500,
        endTimeMs: 90000,
        speaker: 'patient',
        confidence: 0.93,
      },
      {
        text: "Good. And how is work going? You mentioned some stress with your job last time.",
        startTimeMs: 91000,
        endTimeMs: 96000,
        speaker: 'clinician',
        confidence: 0.92,
      },
      {
        text: "Work is better. I talked to my manager about the workload and they actually reduced some of my responsibilities. That helped a lot with the anxiety.",
        startTimeMs: 96500,
        endTimeMs: 105000,
        speaker: 'patient',
        confidence: 0.91,
      },
      {
        text: "That's a positive step. Based on what you're telling me, I think the sertraline is working well for you. I'd like to keep you at the hundred milligram dose. For the sleep issues, I'd like to try adding a low dose of trazodone at bedtime. We'll start with twenty-five milligrams.",
        startTimeMs: 106000,
        endTimeMs: 122000,
        speaker: 'clinician',
        confidence: 0.90,
      },
      {
        text: "Okay, that sounds good. Is that a separate medication?",
        startTimeMs: 122500,
        endTimeMs: 125000,
        speaker: 'patient',
        confidence: 0.94,
      },
      {
        text: "Yes, trazodone is an antidepressant that at low doses helps with sleep. It's commonly used and generally well tolerated. You'd take it about thirty minutes before bed.",
        startTimeMs: 125500,
        endTimeMs: 135000,
        speaker: 'clinician',
        confidence: 0.91,
      },
      {
        text: "Let's plan to follow up in four weeks to see how the trazodone is working for your sleep. If you have any concerns before then, don't hesitate to call.",
        startTimeMs: 136000,
        endTimeMs: 145000,
        speaker: 'clinician',
        confidence: 0.93,
      },
      {
        text: "Sounds good, thank you doctor.",
        startTimeMs: 145500,
        endTimeMs: 148000,
        speaker: 'patient',
        confidence: 0.96,
      },
    ];

    const fullText = segments.map((s) => s.text).join(' ');

    return {
      segments,
      fullText,
      language: 'en',
      durationMs: 148000,
    };
  }
}
