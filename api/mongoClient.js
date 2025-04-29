import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.CONNECTION_STRING;
let client;
let isConnected = false;

async function connect() {
  if (!isConnected) {
    client = new MongoClient(uri);
    await client.connect();
    isConnected = true;
    console.log("Connected to MongoDB");
  }
  return client;
}

async function getDb(dbName = "sabor_dos") {
  const client = await connect();
  return client.db(dbName);
}

async function closeConnection() {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

export { getDb, closeConnection };