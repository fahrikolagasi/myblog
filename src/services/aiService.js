import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// NOTE: Make sure VITE_GEMINI_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generates a response from Gemini based on chat history and context.
 * 
 * @param {Array} history - Array of { role: 'user' | 'model', parts: [{ text: string }] }
 * @param {String} userMessage - The new message from the user
 * @param {String} systemInstruction - Optional system instruction to guide the bot's persona
 * @returns {Promise<String>} - The AI's response text
 */
// List of models to try in order of preference (High quota -> Older stable)
const MODELS_TO_TRY = [
    "gemini-2.0-flash",      // Flash 2.0 (Often higher limits than 2.5 preview)
    "gemini-2.0-flash-001",  // Specific version
    "gemini-pro",            // Stable Pro
    "gemini-pro-latest"      // Latest Pro
];

/**
 * Generates a response from Gemini based on chat history and context.
 * Uses a fallback strategy to try multiple models if one fails (404 or 429).
 * 
 * @param {Array} history - Array of { role: 'user' | 'model', parts: [{ text: string }] }
 * @param {String} userMessage - The new message from the user
 * @param {String} systemInstruction - Optional system instruction to guide the bot's persona
 * @returns {Promise<String>} - The AI's response text
 */
export const getChatResponse = async (history, userMessage, systemInstruction = "") => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("VITE_GEMINI_API_KEY is missing!");
        return "Üzgünüm, şu an bağlantımda bir sorun var (API Anahtarı eksik). Lütfen yönetici ile iletişime geçin.";
    }

    // Manual System Prompt Injection
    const effectiveHistory = [
        {
            role: "user",
            parts: [{ text: systemInstruction || "Sen yardımsever bir asistansın." }]
        },
        {
            role: "model",
            parts: [{ text: "Anlaşıldı. Belirttiğin kurallara ve role göre cevap vereceğim." }]
        },
        ...history
    ];

    let lastError = null;

    // Try each model in the list until one works
    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`Attempting generation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const chat = model.startChat({
                history: effectiveHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model in loop
        }
    }

    // If all models fail
    console.error("All Gemini models failed. Last error:", lastError);
    if (lastError && lastError.message.includes("429")) {
        return "Şu an çok yoğunum, lütfen biraz sonra tekrar deneyin. (Kota aşımı)";
    }
    return "Şu an cevap veremiyorum, sistemde geçici bir sorun var.";
};
