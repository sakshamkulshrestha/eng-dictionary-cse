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
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = event.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: No token' }) };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Extract uid from the path, e.g., /api/bookmarks/user123
    // In Netlify, event.path would be something like "/.netlify/functions/bookmarks/user123"
    const pathParts = event.path.split('/');
    const requestedUid = pathParts[pathParts.length - 1];

    if (decodedToken.uid !== requestedUid && requestedUid !== 'bookmarks') {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }
    
    const uid = decodedToken.uid; // Always use the verified token's uid for safety

    const db = await connectToDatabase();
    
    const userDoc = await db.collection('users').findOne({ uid });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDoc?.bookmarks || [])
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch bookmarks' }) };
  }
};
