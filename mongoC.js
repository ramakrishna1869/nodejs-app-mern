// mongoC.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Use env vars if available, else fallback to your provided values
const MONGO_USER = (process.env.MONGO_USER || "smilodon").trim();
const MONGO_PASSWORD = (process.env.MONGO_PASSWORD || "your_real_password_here").trim(); 
const MONGO_CLUSTER = (process.env.MONGO_CLUSTER || "cluster0.vyzkc.mongodb.net").trim();
const MONGO_DB = (process.env.MONGO_DB || "smilodon").trim();

if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER) {
  throw new Error("Missing env vars: MONGO_USER, MONGO_PASSWORD or MONGO_CLUSTER");
}

// Encode credentials in case of special chars
const encodedUser = encodeURIComponent(MONGO_USER);
const encodedPass = encodeURIComponent(MONGO_PASSWORD);

// Construct URI using your connection string
const uri = `mongodb+srv://${encodedUser}:${encodedPass}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`;

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
    throw err;
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
