-- Incremental PostgreSQL migration for the existing Project S database.
-- Apply with psql -v ON_ERROR_STOP=1, after a backup and before starting prod.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE TABLE IF NOT EXISTS schema_migrations (
    version varchar(100) PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recommendation_histories
    ADD COLUMN IF NOT EXISTS request_key varchar(64),
    ADD COLUMN IF NOT EXISTS product_code_snapshot varchar(50),
    ADD COLUMN IF NOT EXISTS product_name_snapshot varchar(100),
    ADD COLUMN IF NOT EXISTS brand_snapshot varchar(60),
    ADD COLUMN IF NOT EXISTS calculator_version varchar(30),
    ADD COLUMN IF NOT EXISTS comparisons text,
    ADD COLUMN IF NOT EXISTS feedback varchar(10);

CREATE INDEX IF NOT EXISTS idx_history_member_created
    ON recommendation_histories (member_id, created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uk_history_member_request
    ON recommendation_histories (member_id, request_key);

-- Old comparison data was never stored. Leave NULL instead of fabricating it
-- from today's product measurements. The API exposes [] for these records.
INSERT INTO schema_migrations (version)
    VALUES ('V20261001_01__recommendation_snapshots')
    ON CONFLICT (version) DO NOTHING;

COMMIT;
