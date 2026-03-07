const cloudinary = require('cloudinary').v2;
const { OpenAI } = require('openai');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey && !openaiApiKey.includes('tu_codigo_largo') 
    ? new OpenAI({ apiKey: openaiApiKey }) 
    : null;

const cloudinaryHelper = {
    uploadAttachment: async (filePath) => {
        if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('tu_api_key')) {
            console.log("[Mock] Simulando subida a Cloudinary...");
            return new Promise(resolve => setTimeout(() => {
                resolve({ public_id: "mock_img_123", url: "https://via.placeholder.com/150", filename: "prueba.png" });
            }, 800)); 
        }

        const result = await cloudinary.uploader.upload(filePath, { folder: 'supcrud_attachments' });
        return { public_id: result.public_id, url: result.secure_url, filename: result.original_filename };
    }
};

const openAIHelper = {
    analyzeTicketData: async (subject, description) => {
        if (!openai) {
            console.log("[Mock] Simulando analisis de Inteligencia Artificial...");
            return new Promise(resolve => setTimeout(() => {
                resolve({ suggestedCategory: "Soporte General", suggestedPriority: "Alta", confidence: 0.9, tags: ["urgente"] });
            }, 1000));
        }

        const prompt = `Analiza este ticket. Asunto: "${subject}". Descripcion: "${description}". Devuelve JSON con: suggestedCategory, suggestedPriority, confidence, tags.`;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content);
    }
};

module.exports = { cloudinaryHelper, openAIHelper };