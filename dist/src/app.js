"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const perguntas_1 = __importDefault(require("./routes/perguntas"));
const respostas_1 = __importDefault(require("./routes/respostas"));
const analisar_1 = __importDefault(require("./routes/analisar"));
const usuario_1 = require("./routes/usuario");
const swagger_1 = require("./swagger");
const createApp = (deps = {}) => {
    const app = (0, express_1.default)();
    (0, swagger_1.setupSwagger)(app);
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get("/", (_req, res) => res.json({ message: "Recruit.io API online 🚀" }));
    app.get("/health", (_req, res) => res.json({ ok: true }));
    app.use("/api/usuarios", deps.usuarioRouter ?? (0, usuario_1.createUsuarioRouter)());
    app.use("/api/perguntas", perguntas_1.default);
    app.use("/api/respostas", respostas_1.default);
    app.use("/api/analisar", analisar_1.default);
    return app;
};
exports.createApp = createApp;
const app = (0, exports.createApp)();
exports.default = app;
