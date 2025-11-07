"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const perguntas_js_1 = __importDefault(require("./routes/perguntas.js"));
const respostas_js_1 = __importDefault(require("./routes/respostas.js"));
const analisar_js_1 = __importDefault(require("./routes/analisar.js"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.get("/health", (_req, res) => res.json({ ok: true }));
exports.app.use("/api/perguntas", perguntas_js_1.default);
exports.app.use("/api/respostas", respostas_js_1.default);
exports.app.use("/api/analisar", analisar_js_1.default);
