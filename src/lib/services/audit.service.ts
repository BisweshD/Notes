import { auditRepository, type AuditLogEntry } from '@/lib/repositories/audit.repository';

/**
 * Audit service — provides convenience methods for logging important actions.
 * All audit log entries are immutable (append-only).
 */
export const auditService = {
  /**
   * Log a generic action
   */
  log(entry: AuditLogEntry) {
    try {
      return auditRepository.create(entry);
    } catch (error) {
      // Audit logging should never break the application flow
      console.error('Audit log error:', error);
    }
  },

  // ---- Auth Events ----

  logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return this.log({
      userId,
      action: 'login',
      resourceType: 'session',
      description: 'User logged in',
      ipAddress,
      userAgent,
    });
  },

  logLogout(userId: string) {
    return this.log({
      userId,
      action: 'logout',
      resourceType: 'session',
      description: 'User logged out',
    });
  },

  // ---- Patient Events ----

  logPatientCreate(userId: string, patientId: string, patientName: string) {
    return this.log({
      userId,
      action: 'create',
      resourceType: 'patient',
      resourceId: patientId,
      description: `Created patient: ${patientName}`,
    });
  },

  logPatientView(userId: string, patientId: string) {
    return this.log({
      userId,
      action: 'read',
      resourceType: 'patient',
      resourceId: patientId,
      description: 'Viewed patient chart',
    });
  },

  logPatientUpdate(userId: string, patientId: string) {
    return this.log({
      userId,
      action: 'update',
      resourceType: 'patient',
      resourceId: patientId,
      description: 'Updated patient information',
    });
  },

  // ---- Encounter Events ----

  logEncounterCreate(userId: string, encounterId: string, encounterType: string) {
    return this.log({
      userId,
      action: 'create',
      resourceType: 'encounter',
      resourceId: encounterId,
      description: `Created ${encounterType} encounter`,
    });
  },

  logEncounterStatusChange(
    userId: string,
    encounterId: string,
    fromStatus: string,
    toStatus: string,
  ) {
    return this.log({
      userId,
      action: 'update',
      resourceType: 'encounter',
      resourceId: encounterId,
      description: `Status changed: ${fromStatus} → ${toStatus}`,
      metadata: { fromStatus, toStatus },
    });
  },

  // ---- Recording Events ----

  logRecordingStart(userId: string, encounterId: string, recordingId: string) {
    return this.log({
      userId,
      action: 'create',
      resourceType: 'recording',
      resourceId: recordingId,
      description: 'Started audio recording',
      metadata: { encounterId },
    });
  },

  logRecordingStop(userId: string, encounterId: string, recordingId: string) {
    return this.log({
      userId,
      action: 'update',
      resourceType: 'recording',
      resourceId: recordingId,
      description: 'Stopped audio recording',
      metadata: { encounterId },
    });
  },

  // ---- Note Events ----

  logNoteSign(userId: string, noteId: string, encounterId: string) {
    return this.log({
      userId,
      action: 'sign',
      resourceType: 'note',
      resourceId: noteId,
      description: 'Signed and finalized clinical note',
      metadata: { encounterId },
    });
  },

  logNoteEdit(userId: string, noteId: string, sectionKey: string) {
    return this.log({
      userId,
      action: 'update',
      resourceType: 'note',
      resourceId: noteId,
      description: `Edited note section: ${sectionKey}`,
      metadata: { sectionKey },
    });
  },

  // ---- Query Methods ----

  getResourceHistory(resourceType: string, resourceId: string, limit?: number) {
    return auditRepository.findByResource(resourceType, resourceId, limit);
  },

  getUserActivity(userId: string, limit?: number) {
    return auditRepository.findByUser(userId, limit);
  },

  getRecentActivity(limit?: number) {
    return auditRepository.findRecent(limit);
  },
};
