import { MongoClient } from "mongodb";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@cse-dictionary.<cluster-id>.mongodb.net";
const DB_NAME = process.env.DB_NAME || "eng_dictionary";
const DATA_DIR = process.env.DATA_DIR || "./data";

// List of all term collections to reset
const TERMS = [
    "ai_terms",
    "cloud_terms",
    "coa_terms",
    "cyber_terms",
    "dbms_terms",
    "dsa_terms",
    "networks_terms",
    "os_terms",
    "se_terms",
    "toc_terms"
];

async function resetAllTerms() {
    let client;
    const errors = [];

    try {
        console.log("🔌 Connecting to MongoDB Atlas...");
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log("✅ Connected to cluster.\n");

        const db = client.db(DB_NAME);
        console.log(`📦 Using database: ${db.databaseName}\n`);

        for (const term of TERMS) {
            const filePath = `${DATA_DIR}/${term}.json`;
            const collectionName = term;

            console.log(`--- Processing: ${collectionName} ---`);

            try {
                // Read and validate JSON file
                console.log(`📂 Reading file: ${filePath}`);
                if (!fs.existsSync(filePath)) {
                    throw new Error(`File not found: ${filePath}`);
                }

                const rawData = fs.readFileSync(filePath, "utf-8");
                const data = JSON.parse(rawData);

                if (!Array.isArray(data)) {
                    throw new Error("JSON file must contain an array of documents.");
                }

                console.log(`📄 Found ${data.length} document(s) in JSON file.`);

                // Check if collection exists
                const collections = await db.listCollections({ name: collectionName }).toArray();
                const collectionExists = collections.length > 0;

                if (collectionExists) {
                    console.log(`🗑️ Dropping existing collection: ${collectionName}`);
                    await db.collection(collectionName).drop();
                }

                // Insert new data
                if (data.length === 0) {
                    console.warn(`⚠️ No data to insert for ${collectionName}. Creating empty collection.`);
                    await db.createCollection(collectionName);
                } else {
                    const result = await db.collection(collectionName).insertMany(data);
                    console.log(`✅ Inserted ${result.insertedCount} document(s) into ${collectionName}`);
                }

                console.log(`✨ Completed ${collectionName}\n`);

            } catch (termError) {
                console.error(`❌ Failed to process ${term}:`, termError.message);
                errors.push({ term, error: termError.message });
                console.log(); // empty line for readability
            }
        }

        // Summary
        if (errors.length === 0) {
            console.log("🎉 All 10 term collections reset successfully!");
        } else {
            console.log(`⚠️ Completed with ${errors.length} failure(s):`);
            errors.forEach(({ term, error }) => {
                console.log(`   - ${term}: ${error}`);
            });
            process.exitCode = 1;
        }

    } catch (err) {
        console.error("❌ Fatal error:", err.message);
        process.exitCode = 1;
    } finally {
        if (client) {
            await client.close();
            console.log("🔒 Database connection closed.");
        }
    }
}

resetAllTerms();