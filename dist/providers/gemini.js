"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiAnalisar = geminiAnalisar;
const generative_ai_1 = require("@google/generative-ai");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
async function geminiAnalisar(sistema, usuario) {
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: sistema
    });
    const result = await model.generateContent(usuario);
    return result.response.text().trim();
}
