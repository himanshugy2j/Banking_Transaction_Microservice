// src/routes/transactions.js
import express from "express";
import transactionService from "../services/transactionService.js";

const router = express.Router();

// deposit
router.post("/deposit", async (req, res) => {
  try {
    const { account_id, amount, counterparty, description } = req.body;
    const txn = await transactionService.processDeposit({ account_id, amount, counterparty, description });
    return res.status(201).json(txn);
  } catch (err) {
    console.error("deposit error:", err);
    if (err.code === "NO_OVERDRAFT") return res.status(422).json({ error: "NO_OVERDRAFT" });
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// withdraw
router.post("/withdraw", async (req, res) => {
  try {
    const { account_id, amount, counterparty, description } = req.body;
    const txn = await transactionService.processWithdraw({ account_id, amount, counterparty, description });
    return res.status(201).json(txn);
  } catch (err) {
    console.error("withdraw error:", err);
    if (err.code === "NO_OVERDRAFT") return res.status(422).json({ error: "NO_OVERDRAFT" });
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// statement
router.get("/statement/:accountId", async (req, res) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    const limit = parseInt(req.query.limit || "50", 10);
    const offset = parseInt(req.query.offset || "0", 10);
    const rows = await transactionService.getStatement(accountId, limit, offset);
    return res.json(rows);
  } catch (err) {
    console.error("statement error:", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
