import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '.env');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (error) {
    console.error("Error reading .env:", error.message);
    process.exit(1);
}

if (!apiKey) {
    console.error("API Key not found in .env");
    process.exit(1);
}

console.log("Checking models with API Key...");

async function testGeneration() {
    // Model to test: gemini-flash-latest (Safe alias from list)
    const modelName = "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    console.log(`Testing generation with ${modelName}...`);

    const payload = {
        contents: [{
            parts: [{ text: "Hello, are you working?" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        console.log("Generation Success!");
        if (data.candidates && data.candidates[0].content) {
            console.log("Response:", data.candidates[0].content.parts[0].text);
            fs.writeFileSync('model_test_result.txt', `SUCCESS: ${modelName}`);
        } else {
            console.log("No content in response");
        }

    } catch (error) {
        console.error("Generation Error:", error.message);
        fs.writeFileSync('model_test_result.txt', `FAIL: ${error.message}`);
    }
}

testGeneration();
