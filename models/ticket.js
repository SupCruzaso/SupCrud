const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    // Aislamiento por Workspace (Obligatorio)
    workspaceKey: { type: String, required: true, index: true },
    
    // Identificador público único global
    referenceCode: { type: String, required: true, unique: true, index: true },
    
    // Datos del Usuario Final
    customerEmail: { type: String, required: true },
    
    // Contenido del Ticket
    type: { type: String, enum: ['P', 'Q', 'R', 'S'], required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    
    // Gestión y Estados
    status: { 
        type: String, 
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'], 
        default: 'OPEN' 
    },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = Sin asignar
    
    // Add-on: Attachments (Cloudinary)
    attachments: [{
        public_id: String,
        url: String,
        filename: String
    }],
    
    // Add-on: AI Assist
    aiData: {
        suggestedCategory: String,
        suggestedPriority: String,
        confidence: Number, // Para decidir si se auto-asigna
        tags: [String]
    },
    
    // Historial de eventos (Auditoría)
    history: [{
        action: String, // ej: 'CREATED', 'STATUS_CHANGED', 'AGENT_ASSIGNED'
        performedBy: String, // 'SYSTEM', o el ID del agente
        timestamp: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true // Crea createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Ticket', ticketSchema);