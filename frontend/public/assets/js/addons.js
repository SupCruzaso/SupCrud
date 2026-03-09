/**
 * SupCrud Add-ons Management - Production Ready
 * Handles the global catalog for the Platform Owner.
 */

// Configuración de la API
const API_URL = "/api/v1/addons";

// Referencias al DOM
const grid = document.getElementById("addons-grid");
const totalCount = document.getElementById("total-count");
const enabledCount = document.getElementById("enabled-count");
const disabledCount = document.getElementById("disabled-count");

// Iniciar al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
  loadAddons();
  setupEventListeners();
});

/**
 * Carga los Add-ons desde el backend usando apiFetch
 */
async function loadAddons() {
  try {
    // Mostramos spinner de carga
    grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p class="mt-4 font-mono text-xs text-muted uppercase tracking-widest">Sincronizando con la DB...</p>
            </div>`;

    const response = await apiFetch(API_URL);

    if (!response.ok) throw new Error("Error al obtener los datos");

    const addons = await response.json();
    renderAddons(addons);
    updateStats(addons);
  } catch (error) {
    console.error("Add-ons Error:", error);
    grid.innerHTML = `
            <div class="col-span-full py-10 text-center border border-dashed border-red-500/30 rounded-xl bg-red-500/5">
                <p class="font-mono text-xs text-red-400 uppercase tracking-widest">Error de conexión con el backend</p>
            </div>`;
  }
}

/**
 * Renderiza las tarjetas de los Add-ons en el grid
 */
function renderAddons(addonsList) {
  grid.innerHTML = "";

  addonsList.forEach((addon) => {
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
            <p class="text-xs font-mono text-muted leading-relaxed min-h-[40px]">
                ${addon.description || "Sin descripción disponible."}
            </p>
            <div class="flex items-center justify-between pt-4 border-t border-border/50">
                <span class="text-[10px] font-mono text-muted uppercase">${addon.workspaces_count || 0} Installs</span>
                <button onclick="toggleAddon('${addon.id}', ${addon.enabled})" 
                    class="px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all
                    ${addon.enabled ? "bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20" : "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"}">
                    ${addon.enabled ? "Disable" : "Enable"}
                </button>
            </div>
        `;
    grid.appendChild(card);
  });

  // Botón para crear nuevo (Append al final del grid)
  appendCreateButton();
}

/**
 * Cambia el estado del Add-on (Habilitado/Deshabilitado)
 */
async function toggleAddon(id, currentStatus) {
  try {
    const response = await apiFetch(`${API_URL}/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: !currentStatus }),
    });

    if (response.ok) {
      await loadAddons(); // Recargar datos para reflejar cambios
    }
  } catch (error) {
    console.error("Toggle Error:", error);
  }
}

/**
 * Crea un nuevo Add-on en la plataforma
 */
async function handleCreateAddon() {
  const name = document.getElementById("addon-name").value.trim();
  const key = document.getElementById("addon-key").value.trim();
  const description = document.getElementById("addon-desc").value.trim();

  if (!name || !key) return alert("Nombre y Key son obligatorios");

  const saveBtn = document.getElementById("save-modal");
  saveBtn.disabled = true;
  saveBtn.innerText = "CREATING...";

  try {
    const response = await apiFetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ name, key, description }),
    });

    if (response.ok) {
      closeAddonModal();
      await loadAddons();
      resetForm();
    }
  } catch (error) {
    console.error("Create Error:", error);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerText = "CREATE MODULE";
  }
}

// --- Helpers de Interfaz ---

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

function setupEventListeners() {
  document.getElementById("open-create-modal").onclick = () =>
    document.getElementById("create-modal").classList.remove("hidden");
  document.getElementById("close-modal").onclick = closeAddonModal;
  document.getElementById("cancel-modal").onclick = closeAddonModal;
  document.getElementById("save-modal").onclick = handleCreateAddon;
}

function closeAddonModal() {
  document.getElementById("create-modal").classList.add("hidden");
}

function resetForm() {
  document.getElementById("addon-name").value = "";
  document.getElementById("addon-key").value = "";
  document.getElementById("addon-desc").value = "";
}
