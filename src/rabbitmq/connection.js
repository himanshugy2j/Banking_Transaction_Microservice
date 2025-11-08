import amqplib from "amqplib";
import dotenv from "dotenv";
dotenv.config();

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("❌ RabbitMQ connection failed:", error);
    throw error;
  }
};

export const getChannel = () => channel;
