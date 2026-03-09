const openai = require("../config/openai");

/**
 * Clasifica un ticket automáticamente usando IA.
 * @param {Object} ticketData - { subject, description, type }
 * @returns {Object} Clasificación sugerida
 */
async function classifyTicket({ subject, description, type }) {
  try {
    const prompt = `
      Actúa como un experto en soporte técnico de una plataforma SaaS llamada SupCrud.
      Tu tarea es clasificar el siguiente ticket de soporte (PQRS).
      
      DATOS DEL TICKET:
      - Asunto: ${subject}
      - Descripción: ${description}
      - Tipo original: ${type} (P: Petición, Q: Queja, R: Reclamo, S: Sugerencia)
      
      RESPONDE ÚNICAMENTE EN FORMATO JSON con la siguiente estructura:
      {
        "priority": "LOW" | "MEDIUM" | "HIGH",
        "category": "Tecnico" | "Facturacion" | "Cuenta" | "Ventas",
        "tags": ["tag1", "tag2"],
        "confidence": 0.0 a 1.0,
        "reasoning": "Breve explicación de por qué esta clasificación"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente de backend que clasifica datos estructurados.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Mantenerlo consistente
    });

    const suggestion = JSON.parse(response.choices[0].message.content);

    // Log interno para auditoría
    console.log(`🤖 AI classified ticket [${subject}]: ${suggestion.priority}`);

    return {
      ...suggestion,
      applied: false, // Por defecto no se aplica hasta validar umbral en el service
      agentId: null, // Podrías extender esto con lógica de asignación
    };
  } catch (error) {
    console.error("❌ Error en openaiAssist:", error.message);
    throw error;
  }
}

module.exports = {
  classifyTicket,
};
