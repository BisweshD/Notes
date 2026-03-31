CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text,
	`description` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`consent_type` text NOT NULL,
	`status` text NOT NULL,
	`granted_at` text,
	`revoked_at` text,
	`expires_at` text,
	`notes` text,
	`recorded_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `diagnoses` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`encounter_id` text,
	`code` text,
	`code_system` text DEFAULT 'ICD-10',
	`description` text NOT NULL,
	`category` text,
	`status` text DEFAULT 'active' NOT NULL,
	`onset_date` text,
	`resolved_date` text,
	`notes` text,
	`diagnosed_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`diagnosed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `encounter_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`template_id` text,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`signed_at` text,
	`signed_by` text,
	`amendment_reason` text,
	`previous_version_id` text,
	`is_locked` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `note_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`signed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `encounter_recordings` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`recording_number` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'recording' NOT NULL,
	`file_path` text,
	`file_size_bytes` integer,
	`mime_type` text DEFAULT 'audio/webm',
	`duration_seconds` integer,
	`sample_rate` integer,
	`channels` integer DEFAULT 1,
	`started_at` text NOT NULL,
	`ended_at` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `encounters` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinician_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`encounter_type` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`scheduled_at` text,
	`started_at` text,
	`ended_at` text,
	`duration_seconds` integer,
	`chief_concern` text,
	`location` text,
	`is_billable` integer DEFAULT true,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinician_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evidence_links` (
	`id` text PRIMARY KEY NOT NULL,
	`note_section_id` text NOT NULL,
	`transcript_segment_id` text NOT NULL,
	`relevance_score` real,
	`highlight_start` integer,
	`highlight_end` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`note_section_id`) REFERENCES `note_sections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transcript_segment_id`) REFERENCES `transcript_segments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `extraction_results` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`job_id` text NOT NULL,
	`extraction_type` text NOT NULL,
	`data` text NOT NULL,
	`confidence` real,
	`source_segments` text,
	`is_reviewed` integer DEFAULT false,
	`reviewed_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `processing_jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `follow_up_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text,
	`patient_id` text NOT NULL,
	`assigned_to` text,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'normal',
	`due_date` text,
	`completed_at` text,
	`completed_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `measurement_results` (
	`id` text PRIMARY KEY NOT NULL,
	`measurement_type_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`encounter_id` text,
	`total_score` real,
	`item_scores` text,
	`interpretation` text,
	`administered_at` text NOT NULL,
	`administered_by` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`measurement_type_id`) REFERENCES `measurement_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`administered_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `measurement_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`scoring_info` text,
	`questions` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `medication_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`medication_id` text NOT NULL,
	`encounter_id` text NOT NULL,
	`change_type` text NOT NULL,
	`previous_dosage` text,
	`new_dosage` text,
	`reason` text,
	`changed_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`name` text NOT NULL,
	`brand_name` text,
	`dosage` text,
	`frequency` text,
	`route` text,
	`status` text DEFAULT 'active' NOT NULL,
	`prescribed_date` text,
	`discontinued_date` text,
	`discontinue_reason` text,
	`indication` text,
	`side_effects` text,
	`adherence_notes` text,
	`prescribed_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prescribed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `note_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`section_key` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`sort_order` integer NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`ai_confidence` real,
	`is_approved` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `encounter_notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `note_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`name` text NOT NULL,
	`encounter_type` text NOT NULL,
	`sections` text NOT NULL,
	`is_default` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`settings` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`medical_record_number` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`preferred_name` text,
	`date_of_birth` text NOT NULL,
	`sex` text,
	`gender_identity` text,
	`pronouns` text,
	`phone` text,
	`email` text,
	`address` text,
	`emergency_contact` text,
	`insurance_info` text,
	`primary_language` text DEFAULT 'English',
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `processing_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`job_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider` text,
	`input_data` text,
	`output_data` text,
	`error_message` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`started_at` text,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `risk_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`risk_type` text NOT NULL,
	`level` text NOT NULL,
	`risk_factors` text,
	`protective_factors` text,
	`interventions` text,
	`safety_plan` text,
	`notes` text,
	`assessed_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assessed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transcript_segments` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`recording_id` text NOT NULL,
	`segment_index` integer NOT NULL,
	`speaker` text,
	`start_time_ms` integer NOT NULL,
	`end_time_ms` integer NOT NULL,
	`text` text NOT NULL,
	`confidence` real,
	`is_edited` integer DEFAULT false,
	`original_text` text,
	`language` text DEFAULT 'en',
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`encounter_id`) REFERENCES `encounters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recording_id`) REFERENCES `encounter_recordings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`title` text,
	`credentials` text,
	`role` text DEFAULT 'clinician' NOT NULL,
	`organization_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);