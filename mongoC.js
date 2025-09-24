// mongoC.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_USER = (process.env.MONGO_USER || process.env.MONGO_USERNAME || "").trim();
const MONGO_PASSWORD = (process.env.MONGO_PASSWORD || "").trim();
const MONGO_CLUSTER = (process.env.MONGO_CLUSTER || "").trim();
const MONGO_DB = (process.env.MONGO_DB || "smilodon").trim();

if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER) {
  throw new Error("Missing env vars: MONGO_USER, MONGO_PASSWORD or MONGO_CLUSTER");
}

const encodedUser = encodeURIComponent(MONGO_USER);
const encodedPass = encodeURIComponent(MONGO_PASSWORD);
const uri = `mongodb+srv://${encodedUser}:${encodedPass}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

// cached DB object
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  try {
    await client.connect();
    cachedDb = client.db(MONGO_DB);
    console.log("✅ MongoDB connection successful");
    return cachedDb;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err; // rethrow so caller can handle/exit
  }
}

export function getDb() {
  if (!cachedDb) throw new Error("Database not connected. Call connectToDatabase() first.");
  return cachedDb;
}

export async function closeConnection() {
  if (client) {
    await client.close();
    cachedDb = null;
  }
}
