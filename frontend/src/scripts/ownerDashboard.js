/**
 * SupCrud Owner Dashboard Logic
 * Role: Backend Lead / Integration Specialist
 */

// ── Configuration & State ──────────────────────────────────
const API_BASE_URL = "http://localhost:3000/api";
let workspaces = [];

// ── Icons Registry ─────────────────────────────────────────
const ICONS = {
  building: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
  ticket: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 011 1v3a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 011-1h1a1 1 0 001-1V7a2 2 0 00-2-2H5z"/></svg>`,
  ai: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
};

// ── Core Service Calls ─────────────────────────────────────
const WorkspaceService = {
  async getAll() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/workspaces/my-workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch workspaces");
    return await response.json();
  },

  async updateStatus(id, newStatus) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/workspaces/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    return response.ok;
  },
};

// ── UI Rendering Logic ─────────────────────────────────────
function renderStats(wsList) {
  const statsGrid = document.getElementById("stats-grid");
  if (!statsGrid) return;

  const totals = wsList.reduce(
    (acc, w) => ({
      tickets: acc.tickets + (w.ticketsTotal || 0),
      open: acc.open + (w.ticketsOpen || 0),
      aiTasks: acc.aiTasks + (w.addonsActive || 0),
    }),
    { tickets: 0, open: 0, aiTasks: 0 },
  );

  const cards = [
    {
      label: "Global Tickets",
      value: totals.tickets,
      color: "text-primary",
      icon: ICONS.ticket,
    },
    {
      label: "Active PQRS",
      value: totals.open,
      color: "text-warn",
      icon: ICONS.ticket,
    },
    {
      label: "AI Classifications",
      value: totals.aiTasks,
      color: "text-accent",
      icon: ICONS.ai,
    },
  ];

  statsGrid.innerHTML = cards
    .map(
      (c) => `
        <div class="stat-card bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
            <div class="flex items-center gap-2 mb-3">
                <span class="${c.color}">${c.icon}</span>
                <span class="text-[10px] font-mono text-muted uppercase tracking-widest">${c.label}</span>
            </div>
            <p class="text-2xl font-bold text-fg">${c.value.toLocaleString()}</p>
        </div>
    `,
    )
    .join("");
}

function renderTable() {
  const tbody = document.getElementById("ws-tbody");
  if (!tbody) return;

  tbody.innerHTML = workspaces
    .map(
      (ws) => `
        <tr class="border-b border-border hover:bg-white/[0.02] transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">${ICONS.building}</div>
                    <span class="font-medium text-sm">${ws.name}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-[10px] font-mono border ${ws.status === "ACTIVE" ? "border-accent/30 text-accent" : "border-red-500/30 text-red-400"}">
                    ${ws.status}
                </span>
            </td>
            <td class="px-6 py-4 font-mono text-xs text-muted">${ws.plan || "Pro"}</td>
            <td class="px-6 py-4 font-mono text-sm">${ws.ticketsTotal || 0}</td>
            <td class="px-6 py-4">
                <button onclick="handleToggleStatus(${ws.id})" class="px-3 py-1 rounded bg-secondary border border-border text-[10px] uppercase hover:bg-primary/10 transition-all">
                    ${ws.status === "ACTIVE" ? "Suspend" : "Activate"}
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
}

// ── Event Handlers ─────────────────────────────────────────
async function handleToggleStatus(id) {
  const ws = workspaces.find((w) => w.id === id);
  const nextStatus = ws.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const success = await WorkspaceService.updateStatus(id, nextStatus);
  if (success) {
    ws.status = nextStatus;
    renderTable();
    renderStats(workspaces);
  }
}

// ── Initialization ─────────────────────────────────────────
async function init() {
  const loader = document.getElementById("loader");
  const content = document.getElementById("table-wrap");

  try {
    loader?.classList.remove("hidden");
    const result = await WorkspaceService.getAll();
    workspaces = result.data;

    renderStats(workspaces);
    renderTable();
  } catch (err) {
    console.error("Dashboard Sync Error:", err);
  } finally {
    loader?.classList.add("hidden");
    content?.classList.remove("hidden");
  }
}

window.handleToggleStatus = handleToggleStatus;

document.addEventListener("DOMContentLoaded", init);
