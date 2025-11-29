import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const translateText = async (text, targetLang) => {
    if (!genAI) {
        console.warn("Gemini API Key not found");
        return "Translation (Mock): " + text;
    }

    try {
        // Using Gemini 3.0 Pro - The latest state-of-the-art model (Released Nov 2025)
        const model = genAI.getGenerativeModel({ model: "gemini-3.0-pro" });
        const prompt = `Translate the following text to ${targetLang === 'vi' ? 'Vietnamese' : 'English'}. Only return the translated text, nothing else.\n\nText: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Translation error:", error);
        return "Error translating";
    }
};
