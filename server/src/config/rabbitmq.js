const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || "smartqueue.appointments";
const RABBITMQ_EXCHANGE_TYPE = process.env.RABBITMQ_EXCHANGE_TYPE || "fanout";

let connection = null;
let channel = null;

const ensureConnection = async () => {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(RABBITMQ_EXCHANGE, RABBITMQ_EXCHANGE_TYPE, { durable: true });

    connection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error.message);
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    console.log(`RabbitMQ connected at ${RABBITMQ_URL}`);
    return { connection, channel };
  } catch (error) {
    console.warn("RabbitMQ unavailable, falling back to local handlers:", error.message);
    connection = null;
    channel = null;
    return null;
  }
};

const publishAppointmentConfirmed = async (payload) => {
  const broker = await ensureConnection();
  if (!broker?.channel) {
    return false;
  }

  const body = Buffer.from(JSON.stringify(payload));
  return broker.channel.publish(RABBITMQ_EXCHANGE, "", body, {
    contentType: "application/json",
    persistent: true
  });
};

const consumeFromQueue = async (queueName, handler) => {
  const broker = await ensureConnection();
  if (!broker?.channel) {
    return false;
  }

  await broker.channel.assertQueue(queueName, { durable: true });
  await broker.channel.bindQueue(queueName, RABBITMQ_EXCHANGE, "");
  await broker.channel.prefetch(1);

  await broker.channel.consume(queueName, async (message) => {
    if (!message) {
      return;
    }

    try {
      const payload = JSON.parse(message.content.toString());
      await handler(payload);
      broker.channel.ack(message);
    } catch (error) {
      console.error(`RabbitMQ consumer error in ${queueName}:`, error.message);
      broker.channel.nack(message, false, false);
    }
  });

  console.log(`RabbitMQ consumer ready: ${queueName}`);
  return true;
};

const closeRabbit = async () => {
  if (channel) {
    await channel.close().catch(() => {});
  }

  if (connection) {
    await connection.close().catch(() => {});
  }

  connection = null;
  channel = null;
};

module.exports = {
  RABBITMQ_EXCHANGE,
  ensureConnection,
  publishAppointmentConfirmed,
  consumeFromQueue,
  closeRabbit
};
