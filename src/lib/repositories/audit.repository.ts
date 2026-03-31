import { getDb } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogEntry {
  userId?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'sign' | 'export' | 'login' | 'logout';
  resourceType: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditRepository = {
  /**
   * Create an immutable audit log entry.
   * Audit logs are append-only — no updates or deletes.
   */
  create(entry: AuditLogEntry) {
    const db = getDb();
    const id = uuidv4();

    db.insert(auditLogs)
      .values({
        id,
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        description: entry.description,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      })
      .run();

    return id;
  },

  /**
   * Find audit logs by resource
   */
  findByResource(resourceType: string, resourceId: string, limit: number = 50) {
    const db = getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.resourceId, resourceId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .all();
  },

  /**
   * Find audit logs by user
   */
  findByUser(userId: string, limit: number = 50) {
    const db = getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .all();
  },

  /**
   * Get recent audit logs
   */
  findRecent(limit: number = 100) {
    const db = getDb();
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .all();
  },
};
