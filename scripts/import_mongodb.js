import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🔥 DOMAIN-WISE IMPORT STARTED");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "dotenv/config";
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ ERROR: MONGODB_URI not found in environment.");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected");

    const db = client.db("eng_dictionary");

    const dataFolder = path.join(__dirname, "data");
    const files = fs.readdirSync(dataFolder);

    for (let file of files) {
      if (!file.endsWith(".json")) continue;

      const domainName = file.replace(".json", "").toLowerCase();
      const collectionName = `${domainName}_terms`;

      console.log(`📂 Creating collection: ${collectionName}`);

      const collection = db.collection(collectionName);

      const filePath = path.join(dataFolder, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      let count = 0;

      for (let item of data) {
        if (!item.term) continue;

        item.domain = domainName.toUpperCase();

        await collection.updateOne(
          { term: item.term },
          { $set: item },
          { upsert: true }
        );

        count++;
      }

      console.log(`✅ ${collectionName}: ${count} items`);
    }

    console.log("🚀 All domains imported");
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await client.close();
    console.log("🔒 Closed");
  }
}

run();