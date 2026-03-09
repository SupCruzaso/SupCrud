const cloudinary = require("cloudinary").v2;

/**
 * Configuración global de Cloudinary para el manejo de archivos de SupCrud
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Forzamos el uso de HTTPS para los assets
});

// Verificación rápida en arranque (opcional para logs)
console.log("✅ Cloudinary Configured: ", process.env.CLOUDINARY_CLOUD_NAME);

module.exports = cloudinary;
