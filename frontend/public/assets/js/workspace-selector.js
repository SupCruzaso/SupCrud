/**
 * SupCrud Workspace Selector
 * Handles secure fetching and professional rendering of user workspaces.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("ws-list");
  if (!listContainer) return;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/workspaces/my-workspaces",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid server response (Non-JSON)");
    }

    const result = await response.json();

    if (response.ok) {
      // Ajuste para manejar tanto el array directo como el objeto { data: [] }
      const workspaces = Array.isArray(result) ? result : result.data || [];
      renderWorkspaces(workspaces);
    } else {
      showEmptyState(result.message || "Could not load your workspaces.");
    }
  } catch (error) {
    console.error("[Selector Debug]:", error);
    showEmptyState("Connection error. Please check if the server is running.");
  }
});

/**
 * Renders the list of workspaces or triggers empty state
 */
function renderWorkspaces(workspaces) {
  const listContainer = document.getElementById("ws-list");

  // 1. Filtramos los nulos y nos aseguramos de que sea un array
  const validWorkspaces = (workspaces || []).filter(
    (ws) => ws !== null && ws !== undefined,
  );

  // 2. Usamos validWorkspaces para el chequeo de longitud
  if (validWorkspaces.length === 0) {
    showEmptyState("You don't have any workspaces yet.");
    return;
  }

  // 3. Usamos validWorkspaces para el renderizado
  listContainer.innerHTML = validWorkspaces
    .map((ws, i) => {
      // Usamos valores por defecto para evitar errores de undefined
      const isSuspended = ws.status === "SUSPENDED";
      const workspaceId = ws.id || "";
      const name = ws.name || "Unnamed Workspace";
      const workspaceKey = ws.workspaceKey || "********";

      return `
      <div class="ws-card bg-card border ${isSuspended ? "border-red-500/20 opacity-60 cursor-not-allowed" : "border-border cursor-pointer hover:border-primary/50 hover:scale-[1.01]"} rounded-xl p-4 flex items-center gap-4 transition-all duration-150"
           style="animation-delay:${i * 0.05}s"
           onclick="${isSuspended ? "" : `handleSelect('${workspaceId}')`}">
        
        <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <span class="font-display font-bold text-lg">${name.charAt(0).toUpperCase()}</span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <h3 class="font-display font-semibold text-fg text-sm truncate">${name}</h3>
            ${isSuspended ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 uppercase">Suspended</span>` : ""}
          </div>
          <div class="flex items-center gap-3 text-[10px] font-mono text-muted uppercase">
            <span>KEY: ${workspaceKey.substring(0, 8)}</span>
            <span>·</span>
            <span>${isSuspended ? "Contact Admin" : "Active Workspace"}</span>
          </div>
        </div>

        ${
          !isSuspended
            ? `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>`
            : ""
        }
      </div>
    `;
    })
    .join("");
}
/**
 * Handles workspace selection and redirection
 */
function handleSelect(id) {
  localStorage.setItem("selectedWorkspaceId", id);

  const container = document.getElementById("ws-list");
  container.style.opacity = "0.4";
  container.style.pointerEvents = "none";

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 150);
}

/**
 * Renders an empty state with a call to action
 */
function showEmptyState(message) {
  const listContainer = document.getElementById("ws-list");
  // Detección mejorada de estado vacío vs error
  const isNoWorkspaces =
    message.toLowerCase().includes("don't have") ||
    message.toLowerCase().includes("no workspaces");

  listContainer.innerHTML = `
    <div class="py-12 px-6 text-center border border-dashed border-border rounded-xl fade-up">
      <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted/5 text-muted mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      
      <p class="text-xs font-mono text-muted uppercase tracking-widest mb-6">${message}</p>
      
      ${
        isNoWorkspaces
          ? `
        <a href="create-workspace.html" 
           class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Workspace
        </a>
      `
          : `
        <button onclick="window.location.reload()" 
                class="text-[10px] font-mono text-primary hover:underline uppercase tracking-tight">
          Try again
        </button>
      `
      }
    </div>
  `;
}
