import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const list = await ai.models.list();
        // Since list might be an iterator or array, let's see how to traverse it.
        console.log("Models:", list);
    } catch (e) {
        console.error("List failed:", e);
    }
}
run();
