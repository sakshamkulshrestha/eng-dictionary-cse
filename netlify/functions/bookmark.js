import { MongoClient } from 'mongodb';
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gen-lang-client-0646334578"
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client.db('eng_dictionary');
  return cachedDb;
}

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = event.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: No token' }) };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;
    const body = JSON.parse(event.body);
    const { term, action = 'add' } = body;

    if (!term) return { statusCode: 400, body: JSON.stringify({ error: 'Term required' }) };

    const db = await connectToDatabase();
    
    const updateOp = action === 'add' 
      ? { $addToSet: { bookmarks: term } }
      : { $pull: { bookmarks: term } };

    await db.collection('users').updateOne(
      { uid },
      updateOp,
      { upsert: true }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, term, action })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update bookmark' }) };
  }
};
