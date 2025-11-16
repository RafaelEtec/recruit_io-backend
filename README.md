<img width="1581" height="429" alt="Group 1(1)" src="https://github.com/user-attachments/assets/6086933a-34fc-4bc5-a56b-315584ae627c" />

# 🧠 Recruit.io — Backend  
API Inteligente para Avaliação de Entrevistas Técnicas

O **Recruit.io** é uma plataforma projetada para ajudar **recrutadores** a avaliar respostas fornecidas por candidatos em processos seletivos técnicos. 

O backend disponibiliza endpoints para gerenciar perguntas, respostas e análises automáticas utilizando modelos gratuitos da Google.

---

## 🚀 Tecnologias Utilizadas
- **Node.js**
- **TypeScript**
- **Express**
- **Prisma ORM**
- **Neon PostgreSQL**
- **Google Gemini 2.5 Flash**
- **Zod** (validação de entrada)  
- Deploy: **Vercel (Serverless Functions)**

---

## 🌐 URL Base da API
https://recruit-io-backend.vercel.app

---

# 📡 Endpoints da API
## 📁 Perguntas — `/api/perguntas`

### **POST /api/perguntas**
Cria uma nova pergunta.

**Exemplo de body:**
```json
{
  "texto": "Explique o conceito de closures em JavaScript",
  "tags": ["logica", "javascript"]
}
```

### **GET /api/perguntas**
Retorna todas as perguntas cadastradas.

---

## 📝 Respostas — `/api/respostas`

### **POST /api/respostas**
Registra a resposta de um candidato.

**Exemplo de body:**
```json
{
  "candidato": "João da Silva",
  "perguntaId": "uuid-da-pergunta",
  "resposta": "Resposta do candidato aqui..."
}
```

### **GET /api/respostas**
Retorna todas as respostas enviadas.

---

## 🤖 Analisar — `/api/analisar`
Realiza análise automática da resposta usando IA (Google Gemini 2.5 Flash).

### **POST /api/analisar**
Envia uma resposta para análise com base em critérios definidos.

**Exemplo de body:**
```json
{
  "respostaId": "uuid-da-resposta",
  "criterios": ["criatividade", "clareza", "seguranca"],
  "contextoPergunta": "Contexto opcional da pergunta"
}
```

### **GET /api/analisar**
Endpoint simples que confirma o funcionamento do módulo de análise.

---

## ❤️ Healthcheck — `/health`
Retorna o status da API.

**Exemplo de resposta:**
```json
{ "status": "ok" }
```

---

## 🧱 Estrutura do Projeto
```
src/
 ├── routes/
 │   ├── perguntas.ts
 │   ├── respostas.ts
 │   └── analisar.ts
 ├── providers/
 │   └── gemini.ts
 ├── prompts/
 │   └── rubrica.ts
 ├── tipos/
 ├── server.ts
 └── app.ts
```

---

## 🛠️ Como Rodar Localmente

### 1. Clone o repositório
```bash
git clone https://github.com/RafaelEtec/recruit_io-backend.git
cd recruit_io-backend
```
### 2. Instale as dependências
```bash
npm install
```
### 3. Crie e configure o arquivo .env
```bash
DATABASE_URL="postgres://..."
GEMINI_API_KEY="sua-chave-aqui"
```
## 4. Execute as migrações do banco
```bash
npx prisma migrate dev
```
## 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

---

## 🔮 Melhorias Futuras

* Autenticação JWT para avaliadores
* Sistema de ranking de candidatos
* Painel administrativo (frontend)
* Suporte para múltiplos avaliadores/empresas
* Modelos próprios de IA (future fine-tuning)

---

## 🤝 Contribuindo
Contribuições são bem-vindas!
Para sugestões, melhorias ou bugs, abra uma issue.

---

## 📄 Licença
Este projeto está sob a licença MIT.

---
