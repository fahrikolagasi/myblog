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

console.log("Checking v1 models with API Key...");

async function listModelsV1() {
    // Note: v1 endpoint, not v1beta
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Available Models (v1):");
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('1.5')) {
                    console.log(`- ${m.name} (Version: ${m.version})`);
                }
            });
        } else {
            console.log("No models found.");
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listModelsV1();
