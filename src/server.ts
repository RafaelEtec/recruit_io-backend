import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Recruit.io API (PT-BR) rodando na porta ${PORT}`);
  console.log(`Redoc docs: http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
});
