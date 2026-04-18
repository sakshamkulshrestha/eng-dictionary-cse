import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'eng_dictionary';

let dbClient: MongoClient | null = null;
let dbInstance: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!MONGO_URI) {
    const errorMsg = "❌ MONGO_URI missing in environment vars";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    console.log("⏳ Connecting to MongoDB...");
    dbClient = new MongoClient(MONGO_URI);
    await dbClient.connect();
    dbInstance = dbClient.db(DB_NAME);
    console.log(`✅ Connected to MongoDB (Database: ${DB_NAME})`);
    return dbInstance;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    throw error;
  }
}

export function getDB(): Db {
  if (!dbInstance) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return dbInstance;
}
