import { MongoClient, ObjectId } from 'mongodb';

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
    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (id === 'terms' || id === '') {
      const collections = (await db.listCollections().toArray()).filter(c => c.name.endsWith('_terms'));
      let allTerms = [];
      for (const col of collections) {
        const data = await db.collection(col.name).find({}).toArray();
        allTerms = allTerms.concat(data);
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allTerms.map(t => ({ ...t, id: t._id.toString() })))
      };
    } else {
      const collections = (await db.listCollections().toArray()).filter(c => c.name.endsWith('_terms'));
      let term = null;
      for (const col of collections) {
        let query = { $or: [{ id: id }] };
        if (ObjectId.isValid(id)) query.$or.push({ _id: new ObjectId(id) });
        term = await db.collection(col.name).findOne(query);
        if (term) break;
      }
      if (!term) return { statusCode: 404, body: JSON.stringify({ error: 'Term not found' }) };
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...term, id: term._id.toString() })
      };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
