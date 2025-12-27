import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
let apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    try { apiKey = fs.readFileSync('.env', 'utf-8').match(/VITE_GEMINI_API_KEY=(.*)/)[1].trim(); } catch (e) { }
}

const genAI = new GoogleGenerativeAI(apiKey);

// These are models confirmed to exist in the user's account from the check-models.js output
const candidates = [
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-preview-09-2025",
    "gemini-2.5-flash-lite-preview-09-2025",
    "gemini-2.5-flash-image",
    "gemini-pro-latest"
];

async function testModel(modelName) {
    console.log(`Testing: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${modelName} works! Response: ${response.text().slice(0, 20)}...`);
        return true;
    } catch (e) {
        if (e.message.includes("404")) console.log(`❌ 404 Not Found: ${modelName}`);
        else if (e.message.includes("429")) console.log(`⚠️ 429 Rate Limit: ${modelName}`);
        else console.log(`❌ Error ${modelName}: ${e.message.split('\n')[0]}`);
        return false;
    }
}

async function run() {
    console.log("Searching for a working model...");
    for (const m of candidates) {
        if (await testModel(m)) {
            console.log(`\n🏆 WINNER: ${m}`);
            console.log("Use this model in your code.");
            process.exit(0);
        }
    }
    console.log("\n❌ ALL FAILED.");
}

run();
