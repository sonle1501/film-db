CREATE SCHEMA IF NOT EXISTS admin;

-- Import Job History
CREATE TABLE admin.import_job_history (
                                          job_id UUID PRIMARY KEY,
                                          job_type VARCHAR(50),
                                          target_dataset VARCHAR(100),         -- e.g., 'title.basics.tsv.gz' or 'ALL'
                                          status VARCHAR(20),
                                          rows_processed BIGINT DEFAULT 0,
                                          start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                          end_time TIMESTAMP WITH TIME ZONE,
                                          error_message TEXT,
                                          triggered_by UUID
);

-- Admin Audit Log
CREATE TABLE admin.audit_log (
                                 log_id UUID PRIMARY KEY,
                                 admin_id UUID NOT NULL,
                                 target_user_id UUID,
                                 target_entity_id VARCHAR(50),        -- Can be a list_id (UUID) or a movie_id (String)
                                 action_type VARCHAR(50) NOT NULL,    -- 'BAN_USER', 'DELETE_MALICIOUS_LIST', 'FORCE_LOGOUT'...
                                 action_payload JSONB,
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin pending request
CREATE TABLE admin.pending_request (
                                 task_id UUID PRIMARY KEY,
                                 initiator UUID,
                                 target_entity_id VARCHAR(50),        -- Can be a list_id (UUID) or a movie_id (String)...
                                 action_type VARCHAR(50),
                                 state VARCHAR(50),
                                 description TEXT,
                                 priority INTEGER DEFAULT 0,
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);