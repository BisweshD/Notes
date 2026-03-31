import { describe, it, expect } from 'vitest';
import { ENCOUNTER_STATUS_TRANSITIONS, type EncounterStatus } from '@/lib/constants';

describe('Encounter State Machine', () => {
  it('allows scheduled → in_progress transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['scheduled'];
    expect(transitions).toContain('in_progress');
  });

  it('allows scheduled → cancelled transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['scheduled'];
    expect(transitions).toContain('cancelled');
  });

  it('allows in_progress → recording transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['in_progress'];
    expect(transitions).toContain('recording');
  });

  it('allows recording → processing transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['recording'];
    expect(transitions).toContain('processing');
  });

  it('allows processing → review transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['processing'];
    expect(transitions).toContain('review');
  });

  it('allows review → signed transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['review'];
    expect(transitions).toContain('signed');
  });

  it('allows signed → amended transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['signed'];
    expect(transitions).toContain('amended');
  });

  it('does not allow signed → cancelled transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['signed'];
    expect(transitions).not.toContain('cancelled');
  });

  it('does not allow cancelled → any transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['cancelled'];
    expect(transitions).toHaveLength(0);
  });

  it('does not allow amended → any transition', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['amended'];
    expect(transitions).toHaveLength(0);
  });

  it('does not allow scheduled → signed (must go through workflow)', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['scheduled'];
    expect(transitions).not.toContain('signed');
  });

  it('does not allow scheduled → review', () => {
    const transitions = ENCOUNTER_STATUS_TRANSITIONS['scheduled'];
    expect(transitions).not.toContain('review');
  });

  it('has defined transitions for all statuses', () => {
    const allStatuses: EncounterStatus[] = [
      'scheduled',
      'in_progress',
      'recording',
      'processing',
      'review',
      'signed',
      'amended',
      'cancelled',
    ];

    for (const status of allStatuses) {
      expect(ENCOUNTER_STATUS_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(ENCOUNTER_STATUS_TRANSITIONS[status])).toBe(true);
    }
  });
});
