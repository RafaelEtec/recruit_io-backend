<img width="1581" height="429" alt="Group 1(1)" src="https://github.com/user-attachments/assets/6086933a-34fc-4bc5-a56b-315584ae627c" />

# 🧠 Recruit.io - Backend

API Inteligente para Avaliação de Entrevistas Técnicas

O **Recruit.io** é uma plataforma criada para ajudar **recrutadores** e
**empresas** a analisar respostas de candidatos durante entrevistas
técnicas.\
A API permite **gerenciar perguntas**, **registrar respostas** e
realizar **avaliações automáticas usando IA (Google Gemini 2.5 Flash)**.

------------------------------------------------------------------------

## 🚀 Tecnologias Utilizadas

-   **Node.js**
-   **TypeScript**
-   **Express**
-   **Prisma ORM**
-   **Neon PostgreSQL**
-   **Zod** (validação)
-   **Google Gemini 2.5 Flash** (IA)
-   Deploy em **Vercel --- Serverless Functions**

------------------------------------------------------------------------

## 🌐 URL Base da API

**https://recruit-io-backend.vercel.app**

------------------------------------------------------------------------

# 📡 Endpoints da API

## 📁 Perguntas --- `/api/perguntas`

### **POST /api/perguntas**

Cria uma nova pergunta.

**Body exemplo:**

``` json
{
  "texto": "Explique o conceito de closures em JavaScript",
  "tags": ["logica", "javascript"]
}
```

### **GET /api/perguntas**

Retorna todas as perguntas cadastradas.

------------------------------------------------------------------------

## 📝 Respostas --- `/api/respostas`

### **POST /api/respostas**

Registra a resposta de um candidato.

**Body exemplo:**

``` json
{
  "candidato": "João da Silva",
  "perguntaId": "uuid-da-pergunta",
  "resposta": "Minha resposta..."
}
```

### **GET /api/respostas**

Retorna todas as respostas cadastradas.

------------------------------------------------------------------------

## 🤖 Analisar --- `/api/analisar`

### **POST /api/analisar**

Realiza análise automática da resposta usando IA da Google.

**Body exemplo:**

``` json
{
  "respostaId": "uuid-da-resposta",
  "criterios": ["criatividade", "clareza", "seguranca"],
  "contextoPergunta": "Contexto opcional da pergunta"
}
```

### **GET /api/analisar**

Retorna confirmação de funcionamento do módulo de análise.

------------------------------------------------------------------------

## ❤️ Healthcheck --- `/health`

**Resposta exemplo:**

``` json
{ "status": "ok" }
```

------------------------------------------------------------------------

# 🧱 Estrutura do Projeto

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

------------------------------------------------------------------------

# 🛠️ Como Rodar Localmente

### 1. Clone o repositório

``` bash
git clone https://github.com/RafaelEtec/recruit_io-backend.git
cd recruit_io-backend
```

### 2. Instale as dependências

``` bash
npm install
```

### 3. Configure o arquivo `.env`

``` bash
PORT=3000
DATABASE_URL="postgres://..."
GEMINI_API_KEY="sua-chave"
GEMINI_MODEL="gemini-2.5-flash"
```

### 4. Execute as migrações do banco

``` bash
npx prisma migrate dev
```

### 5. Inicie o servidor

``` bash
npm run dev
```

------------------------------------------------------------------------

## 🔒 Variáveis de Ambiente Suportadas

    PORT=
    NODE_ENV=
    DATABASE_URL=
    AI_PROVIDER=
    GEMINI_API_KEY=
    GEMINI_MODEL=

------------------------------------------------------------------------

## 🔮 Melhorias Futuras

-   Autenticação JWT para avaliadores
-   Painel administrativo (dashboard)
-   Ranking de candidatos
-   Suporte multiempresa
-   Métricas avançadas de IA
-   Fine-tuning de modelos no futuro

------------------------------------------------------------------------

## 🤝 Contribuindo

Contribuições são bem-vindas!\
Sinta-se livre para abrir issues ou enviar PRs.

------------------------------------------------------------------------

## 📄 Licença

Este projeto está sob a licença **MIT**.
