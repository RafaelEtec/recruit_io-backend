"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const PORT = Number(process.env.PORT || 3000);
app_js_1.default.listen(PORT, () => {
    console.log(`Recruit.io API (PT-BR) rodando na porta ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
