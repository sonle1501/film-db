
-- 1. Import Job History
CREATE TABLE admin.import_job_history (
    job_id UUID PRIMARY KEY,
    job_type VARCHAR(50),
    target_dataset VARCHAR(100),
    status VARCHAR(20),
    rows_processed BIGINT DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    triggered_by UUID,
    progress NUMERIC(5, 2) DEFAULT 0.0,
    current_stage VARCHAR(50)
);

-- 2. Normalized Import Job Logs
CREATE TABLE admin.import_job_log (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_import_job FOREIGN KEY (job_id) REFERENCES admin.import_job_history(job_id) ON DELETE CASCADE
);

CREATE INDEX idx_import_job_log_job_id ON admin.import_job_log(job_id);

-- 3. Admin Audit Log
CREATE TABLE admin.audit_log (
    log_id UUID PRIMARY KEY,
    admin_id UUID NOT NULL,
    target_user_id UUID,
    target_entity_id VARCHAR(50),
    action_type VARCHAR(50) NOT NULL,
    action_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Admin pending request
CREATE TABLE admin.pending_request (
    task_id UUID PRIMARY KEY,
    initiator UUID,
    target_entity_id VARCHAR(50),
    action_type VARCHAR(50),
    state VARCHAR(50),
    description TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 0 NOT NULL
);
