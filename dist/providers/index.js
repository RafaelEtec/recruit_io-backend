"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rodarAnalise = rodarAnalise;
const hugginface_1 = require("./hugginface");
const gemini_1 = require("./gemini");
async function rodarAnalise(sistema, usuario) {
    const provider = (process.env.AI_PROVIDER || "huggingface").toLowerCase();
    if (provider === "gemini") {
        return await (0, gemini_1.geminiAnalisar)(sistema, usuario);
    }
    if (provider === "huggingface") {
        return await (0, hugginface_1.hfAnalisar)(sistema, usuario);
    }
    throw new Error(`Provedor de IA desconhecido: ${provider}`);
}
