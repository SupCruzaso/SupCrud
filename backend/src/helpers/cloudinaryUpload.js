const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configuración de Cloudinary (Asegúrate de tener estas VARS en tu .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración del almacenamiento para Tickets
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "supcrud/attachments",
    allowed_formats: ["jpg", "png", "pdf", "jpeg"],
    public_id: (req, file) =>
      `ticket-${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
});

/**
 * Función para eliminar un archivo de Cloudinary si un mensaje se borra
 */
async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Error al borrar en Cloudinary:", error.message);
  }
}

module.exports = { upload, deleteFromCloudinary };
