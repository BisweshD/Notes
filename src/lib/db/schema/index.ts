// Re-export all schema tables for Drizzle ORM
export { organizations, users } from './auth';
export { patients } from './patients';
export { encounters, encounterRecordings } from './encounters';
export { transcriptSegments } from './transcripts';
export {
  noteTemplates,
  encounterNotes,
  noteSections,
  evidenceLinks,
} from './notes';
export {
  diagnoses,
  medications,
  medicationChanges,
  riskAssessments,
} from './clinical';
export { measurementTypes, measurementResults } from './measurements';
export { processingJobs, extractionResults } from './pipeline';
export { auditLogs, consentRecords, followUpTasks } from './audit';
