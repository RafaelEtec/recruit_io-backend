"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = require("./app.js");
const PORT = Number(process.env.PORT || 3000);
app_js_1.app.listen(PORT, () => {
    console.log(`Recruit.io API (PT-BR) rodando na porta ${PORT}`);
});
