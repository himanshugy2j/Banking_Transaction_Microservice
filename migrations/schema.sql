-- migrations/schema.sql
-- Transactions table and idempotency keys

CREATE TABLE IF NOT EXISTS transactions (
  txn_id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  txn_type VARCHAR(32) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT
  counterparty TEXT,
  reference TEXT UNIQUE,
  balance_after NUMERIC(18,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  request_hash TEXT,
  request_body JSONB,
  response_body JSONB,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS/COMPLETED/FAILED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_keys(key);
