import { getDb } from '@/lib/db';
import { transcriptSegments } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptSegment } from '@/lib/ai/types';

export const transcriptRepository = {
  findByEncounter(encounterId: string) {
    const db = getDb();
    return db
      .select()
      .from(transcriptSegments)
      .where(eq(transcriptSegments.encounterId, encounterId))
      .orderBy(asc(transcriptSegments.segmentIndex))
      .all();
  },

  findById(id: string) {
    const db = getDb();
    return db.select().from(transcriptSegments).where(eq(transcriptSegments.id, id)).get();
  },

  /**
   * Store transcript segments from a transcription result
   */
  storeSegments(encounterId: string, recordingId: string, segments: TranscriptSegment[]) {
    const db = getDb();
    const now = new Date().toISOString();

    const stored = segments.map((segment, index) => {
      const id = uuidv4();
      db.insert(transcriptSegments)
        .values({
          id,
          encounterId,
          recordingId,
          segmentIndex: index,
          speaker: segment.speaker || 'unknown',
          startTimeMs: segment.startTimeMs,
          endTimeMs: segment.endTimeMs,
          text: segment.text,
          confidence: segment.confidence,
          language: 'en',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      return { id, segmentIndex: index };
    });

    return stored;
  },

  /**
   * Get full transcript text for an encounter
   */
  getFullText(encounterId: string): string {
    const segments = this.findByEncounter(encounterId);
    return segments.map((s) => s.text).join(' ');
  },
};
