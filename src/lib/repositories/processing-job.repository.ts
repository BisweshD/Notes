import { getDb } from '@/lib/db';
import { processingJobs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

type JobType = 'transcription' | 'diarization' | 'extraction' | 'note_generation';
type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export const processingJobRepository = {
  create(encounterId: string, jobType: JobType) {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.insert(processingJobs)
      .values({
        id,
        encounterId,
        jobType,
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return db.select().from(processingJobs).where(eq(processingJobs.id, id)).get()!;
  },

  updateStatus(
    id: string,
    status: JobStatus,
    extra?: {
      provider?: string;
      outputData?: string;
      errorMessage?: string;
      startedAt?: string;
      completedAt?: string;
    },
  ) {
    const db = getDb();
    const now = new Date().toISOString();

    db.update(processingJobs)
      .set({
        status,
        updatedAt: now,
        ...extra,
      })
      .where(eq(processingJobs.id, id))
      .run();

    return db.select().from(processingJobs).where(eq(processingJobs.id, id)).get();
  },

  incrementAttempts(id: string) {
    const db = getDb();
    const job = db.select().from(processingJobs).where(eq(processingJobs.id, id)).get();
    if (!job) return;

    db.update(processingJobs)
      .set({
        attempts: job.attempts + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(processingJobs.id, id))
      .run();
  },

  findByEncounter(encounterId: string) {
    const db = getDb();
    return db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.encounterId, encounterId))
      .all();
  },

  findPending(encounterId: string, jobType: JobType) {
    const db = getDb();
    return db
      .select()
      .from(processingJobs)
      .where(
        and(
          eq(processingJobs.encounterId, encounterId),
          eq(processingJobs.jobType, jobType),
          eq(processingJobs.status, 'pending'),
        ),
      )
      .get();
  },
};
