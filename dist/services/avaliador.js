import { PrismaClient } from "@prisma/client";
import { rodarAnalise } from "../providers/index.js";
import { RUBRICA_SISTEMA, montarPromptUsuario } from "../prompts/rubrica.js";
const prisma = new PrismaClient();
export async function analisarResposta(respostaId, criterios, contextoPergunta) {
    const resposta = await prisma.resposta.findUnique({
        where: { id: respostaId },
        include: { pergunta: true }
    });
    if (!resposta)
        throw new Error("Resposta não encontrada");
    const userPrompt = montarPromptUsuario(resposta.resposta, criterios, contextoPergunta);
    const bruto = await rodarAnalise(RUBRICA_SISTEMA, userPrompt);
    let parsed;
    try {
        parsed = JSON.parse(bruto);
    }
    catch {
        const match = bruto.match(/\{[\s\S]*\}$/);
        if (!match)
            throw new Error("O provedor não retornou JSON válido.");
        parsed = JSON.parse(match[0]);
    }
    const salvo = await prisma.analise.create({
        data: {
            respostaId: resposta.id,
            provider: (process.env.AI_PROVIDER || "huggingface"),
            modelo: process.env.AI_PROVIDER === "gemini"
                ? (process.env.GEMINI_MODEL || "gemini-2.5-flash")
                : (process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct"),
            resultado: parsed
        }
    });
    return salvo;
}
