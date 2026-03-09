/**
 * SupCrud Add-ons Management - Professional API Integration
 * Handling global catalog for the Platform Owner.
 */

const API_BASE = "/api/v1"; // Ajusta según tu backend
const token = localStorage.getItem("token");

// Elementos del DOM
const grid = document.getElementById("addons-grid");
const totalCount = document.getElementById("total-count");
const enabledCount = document.getElementById("enabled-count");
const disabledCount = document.getElementById("disabled-count");

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  fetchAddons();
  setupModalEvents();
});

/**
 * Obtener catálogo global de Add-ons desde la DB (PostgreSQL/Node)
 */
async function fetchAddons() {
  try {
    const response = await fetch(`${API_BASE}/addons`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Unauthorized or Server Error");

    const addons = await response.json();
    renderAddons(addons);
    updateStats(addons);
  } catch (error) {
    console.error("Fetch error:", error);
    grid.innerHTML = `<p class="col-span-full text-center text-red-400 font-mono">Error connecting to the backend. Check your API.</p>`;
  }
}

/**
 * Renderizado dinámico de tarjetas
 */
function renderAddons(addons) {
  grid.innerHTML = ""; // Limpiar spinner

  addons.forEach((addon) => {
    const card = document.createElement("div");
    card.className =
      "bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/25 transition-all fade-up";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-display font-semibold text-fg text-sm">${addon.name}</h3>
          <code class="text-[11px] font-mono text-primary/80">${addon.key}</code>
        </div>
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
          ${addon.enabled ? "bg-accent/10 text-accent border border-accent/25" : "bg-muted/10 text-muted border border-muted/25"}">
          <span class="w-1.5 h-1.5 rounded-full ${addon.enabled ? "bg-accent" : "bg-muted"}"></span>
          ${addon.enabled ? "Active" : "Disabled"}
        </span>
      </div>
      <p class="text-xs font-mono text-muted leading-relaxed min-h-[40px]">${addon.description}</p>
      <div class="flex items-center justify-between pt-4 border-t border-border/50">
        <span class="text-[10px] font-mono text-muted uppercase">${addon.workspaces_count || 0} Installs</span>
        <button onclick="toggleAddonStatus('${addon.id}', ${addon.enabled})" 
          class="px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all
          ${addon.enabled ? "bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20" : "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"}">
          ${addon.enabled ? "Disable" : "Enable"}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Botón para crear uno nuevo (Solo para Owners)
  appendCreateButton();
}

/**
 * Cambiar estado (Active/Disabled) en el Backend
 */
async function toggleAddonStatus(id, currentStatus) {
  try {
    const response = await fetch(`${API_BASE}/addons/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled: !currentStatus }),
    });

    if (response.ok) fetchAddons();
  } catch (error) {
    console.error("Update error:", error);
  }
}

/**
 * Crear nuevo Add-on en la DB
 */
async function createAddon() {
  const payload = {
    name: document.getElementById("addon-name").value.trim(),
    key: document.getElementById("addon-key").value.trim(),
    description: document.getElementById("addon-desc").value.trim(),
  };

  if (!payload.name || !payload.key) return;

  try {
    const response = await fetch(`${API_BASE}/addons`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      closeModal();
      fetchAddons();
    }
  } catch (error) {
    console.error("Create error:", error);
  }
}

// --- HELPERS ---

function updateStats(addons) {
  totalCount.textContent = addons.length;
  enabledCount.textContent = addons.filter((a) => a.enabled).length;
  disabledCount.textContent = addons.filter((a) => !a.enabled).length;
}

function appendCreateButton() {
  const btn = document.createElement("button");
  btn.className =
    "bg-card border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-surface transition-all cursor-pointer min-h-[160px]";
  btn.onclick = () =>
    document.getElementById("create-modal").classList.remove("hidden");
  btn.innerHTML = `
    <div class="w-10 h-10 rounded-lg border border-dashed border-muted/40 flex items-center justify-center text-muted">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
    </div>
    <span class="text-[10px] font-mono text-muted uppercase tracking-widest">New System Add-on</span>
  `;
  grid.appendChild(btn);
}

function setupModalEvents() {
  document.getElementById("close-modal").onclick = closeModal;
  document.getElementById("cancel-modal").onclick = closeModal;
  document.getElementById("save-modal").onclick = createAddon;
}

function closeModal() {
  document.getElementById("create-modal").classList.add("hidden");
}
