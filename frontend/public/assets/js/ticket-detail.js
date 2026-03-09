/**
 * SupCrud Ticket Detail Logic
 * 100% Functional with Node.js API
 */

// Extraer ID de la URL: detail.html?id=XXXX
const urlParams = new URLSearchParams(window.location.search);
const ticketId = urlParams.get("id");
const token = localStorage.getItem("token");
const workspaceId = localStorage.getItem("selectedWorkspaceId");

let currentTicket = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!ticketId || !token) {
    window.location.href = "dashboard.html";
    return;
  }
  await loadTicketData();
  setupEventListeners();
});

async function loadTicketData() {
  try {
    // Usamos el endpoint GET /api/tickets con filtro por ID o uno específico si lo tienes
    // Nota: Si tienes un GET /api/tickets/:id, úsalo. Si no, filtramos del listado.
    const response = await fetch(`/api/tickets?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    const tickets = data.docs || data;

    currentTicket = tickets.find(
      (t) => t._id === ticketId || t.id === ticketId,
    );

    if (!currentTicket) throw new Error("Ticket not found");

    renderUI();
  } catch (error) {
    console.error("Error loading ticket:", error);
  }
}

function renderUI() {
  // 1. Cabecera y Detalles Básicos
  document.querySelector("h1").textContent = currentTicket.subject;
  document.querySelector("code").textContent =
    currentTicket.referenceCode || currentTicket.ref;
  document.getElementById("status-select").value = currentTicket.status;

  // 2. Info Panel (Derecha)
  const detailPanel = document.querySelector(
    ".lg:grid-cols-3 .space-y-4 .bg-card .space-y-3",
  );
  detailPanel.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-mono text-muted">Type</span>
      <span class="type-badge type-${currentTicket.type}">${currentTicket.type}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-mono text-muted">Priority</span>
      <span class="text-xs font-mono font-medium priority-${currentTicket.priority}">${currentTicket.priority}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-mono text-muted">Email</span>
      <span class="text-xs font-mono text-fg truncate max-w-[140px]">${currentTicket.email || currentTicket.customer}</span>
    </div>
  `;

  // 3. Renderizar Mensajes (Historial de Conversación)
  renderMessages();
}

function renderMessages() {
  const container = document.querySelector(
    ".lg:col-span-2 .space-y-4 .bg-card",
  );
  // Filtramos los mensajes que pertenecen a este ticket
  const messages = currentTicket.messages || [];

  let html = `<h2 class="font-display font-semibold text-fg text-[11px] uppercase tracking-wider text-muted">Conversation</h2>`;

  // Mensaje inicial del usuario (Descripción)
  html += `
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-[11px] font-mono text-muted">${currentTicket.email}</span>
        <span class="text-[10px] font-mono text-muted/50">· Original Request</span>
      </div>
      <div class="msg-user p-4 text-sm font-mono text-fg leading-relaxed bg-surface/50 rounded-lg border border-border/30">
        ${currentTicket.description || "No description provided."}
      </div>
    </div>
  `;

  // Respuestas del backend
  messages.forEach((msg) => {
    const isAgent = msg.senderType === "AGENT";
    html += `
      <div class="flex flex-col gap-1 mt-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="${isAgent ? "text-primary" : "text-accent"} text-[11px] font-mono">${msg.senderName} (${msg.senderType})</span>
          <span class="text-[10px] font-mono text-muted/50">· ${new Date(msg.createdAt).toLocaleString()}</span>
        </div>
        <div class="${isAgent ? "msg-agent" : "msg-user"} p-4 text-sm font-mono text-fg leading-relaxed border border-border/20 rounded-lg">
          ${msg.content}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function setupEventListeners() {
  // 1. Actualizar STATUS (PATCH /api/tickets/:id/status)
  document.getElementById("save-status").addEventListener("click", async () => {
    const newStatus = document.getElementById("status-select").value;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert("Status updated successfully!");
        loadTicketData(); // Recargar para ver el historial
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 2. Enviar RESPUESTA (POST /api/tickets/:id/messages)
  document.getElementById("send-reply").addEventListener("click", async () => {
    const content = document.getElementById("reply-text").value.trim();
    if (!content) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        document.getElementById("reply-text").value = "";
        loadTicketData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 3. Reasignar Agente (PATCH /api/tickets/:id/assign)
  document.getElementById("do-assign").addEventListener("click", async () => {
    const agentId = document.getElementById("assign-agent").value;
    if (!agentId) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId: parseInt(agentId) }),
      });
      if (res.ok) {
        alert("Agent reassigned!");
        loadTicketData();
      }
    } catch (err) {
      console.error(err);
    }
  });
}
