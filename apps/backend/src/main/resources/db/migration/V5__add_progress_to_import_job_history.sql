-- Add progress tracking columns to admin.import_job_history
ALTER TABLE admin.import_job_history ADD COLUMN IF NOT EXISTS progress NUMERIC(5, 2) DEFAULT 0.0;
ALTER TABLE admin.import_job_history ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50);
ALTER TABLE admin.import_job_history ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'::jsonb;
