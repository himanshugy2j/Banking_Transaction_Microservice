-- migrations/seed.sql
INSERT INTO transactions (account_id, amount, txn_type, counterparty, reference, balance_after)
VALUES
(1, 10000.00, 'DEPOSIT', 'Seed deposit', 'seed-1', 10000.00)
ON CONFLICT DO NOTHING;
