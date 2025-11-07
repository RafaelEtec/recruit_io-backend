import { hfAnalisar } from "./hugginface";
import { geminiAnalisar } from "./gemini";
export async function rodarAnalise(sistema, usuario) {
    const provider = (process.env.AI_PROVIDER || "huggingface").toLowerCase();
    if (provider === "gemini") {
        return await geminiAnalisar(sistema, usuario);
    }
    if (provider === "huggingface") {
        return await hfAnalisar(sistema, usuario);
    }
    throw new Error(`Provedor de IA desconhecido: ${provider}`);
}
