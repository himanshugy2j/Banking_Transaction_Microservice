import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Get all customers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers LIMIT 10;");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

export default router;
