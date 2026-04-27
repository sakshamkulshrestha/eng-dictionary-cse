import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function testConnection() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  console.log("URI:", uri ? "Present" : "Missing");
  if (!uri) return;

  const client = new MongoClient(uri);
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db('eng_dictionary');
    const collectionsInfo = await db.listCollections().toArray();
    console.log("Collections (raw):", collectionsInfo.map(c => c.name));
    
    const collections = collectionsInfo.filter((c: any) => c.name.endsWith('_terms'));
    console.log("Terms Collections:", collections.map(c => (c as any).name));
    
    for (const col of collections) {
        const count = await db.collection((col as any).name).countDocuments();
        console.log(` - ${col.name}: ${count} documents`);
    }
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
