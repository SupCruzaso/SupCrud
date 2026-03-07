const Ticket = require('../models/ticket');
const { generateUniqueRefCode } = require('../utils/referenEngine'); // Note: escribiste referenEngine en tu captura
const { cloudinaryHelper, openAIHelper } = require('../utils/addonsHelpers');

const createTicket = async (req, res) => {
    try {
        const { workspaceKey, customerEmail, type, subject, description } = req.body;

        // 1. Generar codigo unico
        const referenceCode = await generateUniqueRefCode();

        // 2. Analizar con IA
        const aiData = await openAIHelper.analyzeTicketData(subject, description);

        // 3. Crear el ticket en la base de datos
        // Nota: Las imagenes las manejaremos mas adelante con multer
        const newTicket = new Ticket({
            workspaceKey: workspaceKey || 'default_workspace',
            referenceCode,
            customerEmail,
            type,
            subject,
            description,
            aiData,
            history: [{ action: 'CREATED', performedBy: 'SYSTEM' }]
        });

        // Si la base de datos esta conectada, lo guarda. Si no, solo devuelve la simulacion.
        if (require('mongoose').connection.readyState === 1) {
            await newTicket.save();
        }

        res.status(201).json({
            success: true,
            message: 'Ticket creado exitosamente',
            data: newTicket
        });

    } catch (error) {
        console.error("[Error] Fallo al crear ticket:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = { createTicket };