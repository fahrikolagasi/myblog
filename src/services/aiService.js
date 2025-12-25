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
export const getChatResponse = async (history, userMessage, systemInstruction = "") => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("VITE_GEMINI_API_KEY is missing!");
            return "Üzgünüm, şu an bağlantımda bir sorun var (API Anahtarı eksik). Lütfen yönetici ile iletişime geçin.";
        }

        // Switching to 'gemini-flash-latest' as it appears in the user's available list 
        // and 'gemini-2.0-flash' gave a quota error (limit 0).
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 250,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Şu an cevap veremiyorum, lütfen daha sonra tekrar dene.";
    }
};
