import express from "express";
import dotenv from "dotenv";
import { connectRabbitMQ } from "./rabbitmq/connection.js";
import { connectDB } from "./db/connection.js";
import customerRoutes from "./routes/customers.js";
import accountRoutes from "./routes/accounts.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();
const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Transaction Service" });
});

app.get("/", (req, res) => {
  res.send("✅ Transaction Service is up and running!");
});

// Register routes
app.use("/customers", customerRoutes);
app.use("/accounts", accountRoutes);
app.use("/transactions", transactionRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();
