import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manual env parsing if dotenv fails or just use dotenv
dotenv.config();

// Fallback to manual reading if VITE_GEMINI_API_KEY is not loaded (sometimes .env is not picked up if not specified)
let key = process.env.VITE_GEMINI_API_KEY;

if (!key) {
    try {
        const envContent = fs.readFileSync('.env', 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) {
            key = match[1].trim();
        }
    } catch (e) {
        console.log("Could not read .env manually");
    }
}

if (!key) {
    console.error("ERROR: No VITE_GEMINI_API_KEY found.");
    process.exit(1);
}

console.log(`Checking models for API Key: ${key.substring(0, 8)}...`);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS:");
            data.models.forEach(m => {
                // Filter for "generateContent" supported models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')} \t [${m.displayName}]`);
                }
            });
        } else {
            console.error("❌ API Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("❌ Network/Script Error:", e);
    }
}

listModels();
