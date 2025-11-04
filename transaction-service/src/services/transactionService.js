// src/services/transactionService.js
import pool from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

const HIGH_VALUE_THRESHOLD = parseFloat(process.env.HIGH_VALUE_THRESHOLD || "100000");

async function getLastBalance(client, accountId) {
  const r = await client.query(
    "SELECT balance_after FROM transactions WHERE account_id = $1 ORDER BY created_at DESC LIMIT 1",
    [accountId]
  );
  return r.rows[0] ? parseFloat(r.rows[0].balance_after) : 0.0;
}

export async function processDeposit({ account_id, amount, counterparty, description }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lastBal = await getLastBalance(client, account_id);
    const newBal = lastBal + parseFloat(amount);
    const ref = `DEP-${uuidv4()}`;
    const ins = await client.query(
      `INSERT INTO transactions (account_id, amount, txn_type, counterparty, reference, balance_after)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [account_id, amount, "DEPOSIT", counterparty || "External", ref, newBal]
    );
    await client.query("COMMIT");
    const txn = ins.rows[0];
    // best-effort: publish to RabbitMQ if you already wired publisher
    return txn;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function processWithdraw({ account_id, amount, counterparty, description }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lastBal = await getLastBalance(client, account_id);
    const newBal = lastBal - parseFloat(amount);
    if (newBal < 0) {
      await client.query("ROLLBACK");
      const err = new Error("NO_OVERDRAFT");
      err.code = "NO_OVERDRAFT";
      throw err;
    }
    const ref = `WDL-${uuidv4()}`;
    const ins = await client.query(
      `INSERT INTO transactions (account_id, amount, txn_type, counterparty, reference, balance_after)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [account_id, -Math.abs(amount), "WITHDRAWAL", counterparty || "External", ref, newBal]
    );
    await client.query("COMMIT");
    return ins.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getStatement(accountId, limit = 50, offset = 0) {
  const r = await pool.query(
    "SELECT txn_id, account_id, amount, txn_type, counterparty, reference, balance_after, created_at FROM transactions WHERE account_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [accountId, limit, offset]
  );
  return r.rows;
}

export default {
  processDeposit,
  processWithdraw,
  getStatement,
};
