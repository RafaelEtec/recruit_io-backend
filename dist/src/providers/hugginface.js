"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hfAnalisar = hfAnalisar;
const inference_1 = require("@huggingface/inference");
const HF_MODEL = process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct";
async function hfAnalisar(sistema, usuario) {
    const hf = new inference_1.HfInference(process.env.HUGGINGFACE_API_KEY);
    const prompt = `<|system|>\n${sistema}\n<|end|>\n<|user|>\n${usuario}\n<|end|>\n<|assistant|>\n`;
    const out = await hf.textGeneration({
        model: HF_MODEL,
        inputs: prompt,
        parameters: {
            max_new_tokens: 512,
            temperature: 0.2,
            return_full_text: false
        }
    });
    return out.generated_text.trim();
}
