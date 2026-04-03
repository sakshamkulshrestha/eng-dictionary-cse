import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  if (!MONGODB_URI) throw new Error('MONGODB_URI not defined');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('eng_dictionary');
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export const handler = async (event) => {
  try {
    const { db } = await connectToDatabase();
    const q = event.queryStringParameters.q;
    if (!q) return { statusCode: 200, body: JSON.stringify([]) };
    
    const collections = (await db.listCollections().toArray()).filter(c => c.name.endsWith('_terms'));
    let results = [];
    for (const col of collections) {
      const data = await db.collection(col.name).find({ term: { $regex: q, $options: 'i' } }).limit(10).toArray();
      results = results.concat(data);
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results.map(t => ({ ...t, id: t._id.toString() })))
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
