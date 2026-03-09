const OpenAI = require("openai"); // La Clase (Mayúscula)

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY no detectada.");
}

// Cambiamos el nombre de la instancia a algo más específico para evitar choques
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openaiClient;
