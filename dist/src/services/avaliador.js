"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analisarResposta = analisarResposta;
const client_1 = require("@prisma/client");
const index_1 = require("../providers/index");
const rubrica_1 = require("../prompts/rubrica");
const prisma = new client_1.PrismaClient();
async function analisarResposta(respostaId, criterios, contextoPergunta) {
    const resposta = await prisma.resposta.findUnique({
        where: { id: respostaId },
        include: { pergunta: true }
    });
    if (!resposta)
        throw new Error("Resposta não encontrada");
    const userPrompt = (0, rubrica_1.montarPromptUsuario)(resposta.resposta, criterios, contextoPergunta);
    const bruto = await (0, index_1.rodarAnalise)(rubrica_1.RUBRICA_SISTEMA, userPrompt);
    console.log("\n🧠 Resposta bruta do provedor:\n", bruto, "\n");
    let parsed;
    try {
        const limpo = bruto
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
        parsed = JSON.parse(limpo);
    }
    catch {
        const matches = bruto.match(/\{[\s\S]*?\}/g);
        if (matches && matches.length > 0) {
            for (const bloco of matches) {
                try {
                    parsed = JSON.parse(bloco);
                    break;
                }
                catch {
                    continue;
                }
            }
        }
    }
    if (!parsed) {
        console.error("❌ Resposta inválida da IA, conteúdo recebido:\n", bruto);
        throw new Error("O provedor não retornou JSON válido.");
    }
    if (typeof parsed.overall !== "number" || !parsed.scores) {
        console.warn("⚠️ JSON retornado incompleto, ajustando formato padrão...");
        parsed = {
            overall: parsed.overall ?? 0,
            scores: (parsed.scores ?? {}),
            labels: parsed.labels ?? {},
            notes: parsed.notes ?? ["Formato não conforme especificação original."]
        };
    }
    const salvo = await prisma.analise.create({
        data: {
            respostaId: resposta.id,
            provider: process.env.AI_PROVIDER || "huggingface",
            modelo: process.env.AI_PROVIDER === "gemini"
                ? process.env.GEMINI_MODEL || "gemini-2.5-flash"
                : process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct",
            resultado: parsed
        }
    });
    console.log("✅ Análise salva com sucesso:", salvo.id);
    return salvo;
}
