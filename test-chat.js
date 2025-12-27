import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import dotenv from 'dotenv';

// 1. Load Environment Variables
dotenv.config();
let apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    // Fallback manual read
    try {
        const envContent = fs.readFileSync('.env', 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) { }
}

if (!apiKey) {
    console.error("❌ ERROR: Could not find VITE_GEMINI_API_KEY");
    process.exit(1);
}

console.log(`🔑 API Key found: ${apiKey.slice(0, 8)}...`);

async function testChat() {
    console.log("🚀 Initializing Gemini...");

    const genAI = new GoogleGenerativeAI(apiKey);

    // THE CRITICAL CONFIGURATION WE ARE TESTING
    const MODEL_NAME = "gemini-pro-latest";
    console.log(`🤖 Using Model: ${MODEL_NAME}`);

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME
        });

        // Mimic the exact history structure from aiService.js
        const systemInstruction = "Sen Fahrielsara adında neşeli bir yapay zeka asistanısın.";

        const effectiveHistory = [
            {
                role: "user",
                parts: [{ text: systemInstruction }]
            },
            {
                role: "model",
                parts: [{ text: "Anlaşıldı. Belirttiğin kurallara ve role göre cevap vereceğim." }]
            }
        ];

        console.log("📝 Starting Chat with System Prompt Injection...");

        const chat = model.startChat({
            history: effectiveHistory,
            generationConfig: {
                maxOutputTokens: 100,
            },
        });

        const userMessage = "Merhaba, adın ne ve ne yaparsın?";
        console.log(`🗣️ User: ${userMessage}`);

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        console.log("\n✅ SUCCESS! AI Response:");
        console.log("---------------------------------------------------");
        console.log(text);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("\n❌ TEST FAILED:");
        console.error(error);
        if (error.message.includes("404")) {
            console.error("👉 CAUSE: Model name is incorrect or not available for this API key.");
        } else if (error.message.includes("429")) {
            console.error("👉 CAUSE: Rate limit exceeded (Quota full).");
        }
    }
}

testChat();
