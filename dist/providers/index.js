import { hfAnalisar } from "./hugginface";
export async function rodarAnalise(sistema, usuario) {
    const provider = (process.env.AI_PROVIDER || "huggingface").toLowerCase();
    if (provider !== "huggingface") {
        throw new Error(`Provedor de IA desconhecido: ${provider}`);
    }
    return await hfAnalisar(sistema, usuario);
}
