/**
 * SupCrud Ticket Management Logic - Production Ready
 * Handles API integration, loading states, and real-time filtering.
 */

let allTickets = [];
let filteredTickets = [];

document.addEventListener("DOMContentLoaded", async () => {
  setupFilterListeners();
  await loadTicketsFromServer();
});

/**
 * Fetches tickets from the server and manages loading state
 */
async function loadTicketsFromServer() {
  const tbody = document.getElementById("ticket-tbody");

  showSpinner(tbody);

  const token = localStorage.getItem("token");
  const workspaceId = localStorage.getItem("selectedWorkspaceId");

  if (!token || !workspaceId) {
    showError(
      tbody,
      "No active session or Workspace found. Please log in again.",
    );
    return;
  }

  const API_BASE = "http://localhost:3000";

  try {
    const response = await fetch(
      `${API_BASE}/api/tickets?workspaceId=${workspaceId}&limit=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Server responded with status ${response.status}`,
      );
    }

    const payload = await response.json();

    // API returns { data: [...], pagination: {...} }
    allTickets = payload.data ?? (Array.isArray(payload) ? payload : []);
    filteredTickets = [...allTickets];

    renderTable(filteredTickets);
    updateStats(filteredTickets);
  } catch (error) {
    console.error("[Tickets] Fetch error:", error.message);
    showError(
      tbody,
      "Failed to load tickets. Check your connection and try again.",
    );
  }
}

/**
 * Sets up local filter listeners on already-loaded data
 */
function setupFilterListeners() {
  const filterIds = ["f-status", "f-priority", "f-search"];

  filterIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventType = id === "f-search" ? "input" : "change";
    el.addEventListener(eventType, applyFilters);
  });

  document.getElementById("clear-filters")?.addEventListener("click", () => {
    filterIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    applyFilters();
  });
}

function applyFilters() {
  const sStatus = document.getElementById("f-status")?.value || "";
  const sPriority = document.getElementById("f-priority")?.value || "";
  const sSearch =
    document.getElementById("f-search")?.value.trim().toLowerCase() || "";

  filteredTickets = allTickets.filter((t) => {
    const matchesStatus = !sStatus || t.status === sStatus;
    const matchesPriority = !sPriority || t.priority === sPriority;
    const matchesSearch =
      !sSearch ||
      t.referenceCode?.toLowerCase().includes(sSearch) ||
      t.subject?.toLowerCase().includes(sSearch) ||
      t.email?.toLowerCase().includes(sSearch);

    return matchesStatus && matchesPriority && matchesSearch;
  });

  renderTable(filteredTickets);
  updateStats(filteredTickets);
}

/**
 * UI Components — Spinner, Table, Error state
 */
function showSpinner(container) {
  container.innerHTML = `
    <tr>
      <td colspan="7" class="py-20 text-center">
        <div class="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p class="text-muted font-mono text-[10px] uppercase tracking-widest">Loading tickets...</p>
      </td>
    </tr>`;
}

function showError(container, message) {
  container.innerHTML = `
    <tr>
      <td colspan="7" class="py-20 text-center text-red-400">
        <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
               1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
               0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="font-mono text-[10px] uppercase">${message}</p>
        <button onclick="loadTicketsFromServer()"
          class="mt-4 text-primary text-[10px] hover:underline">
          RETRY
        </button>
      </td>
    </tr>`;
}

function renderTable(tickets) {
  const tbody = document.getElementById("ticket-tbody");
  if (!tbody) return;

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-20 text-center text-muted font-mono text-[10px] uppercase tracking-widest">
          No matching tickets found
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = tickets
    .map(
      (t, i) => `
    <tr class="ticket-row border-b border-border/50 hover:bg-surface/30 transition-colors cursor-pointer group fade-up"
        style="animation-delay: ${i * 0.02}s">
      <td class="px-5 py-4 font-mono text-[11px] text-primary">#${t.referenceCode || t.ref || "—"}</td>
      <td class="px-5 py-4"><span class="type-badge type-${t.type}">${t.type}</span></td>
      <td class="px-5 py-4">
        <div class="flex flex-col">
          <span class="font-medium text-fg text-sm line-clamp-1">${t.subject}</span>
          <span class="text-[10px] text-muted font-mono mt-0.5">${t.email || t.customer || "External"}</span>
        </div>
      </td>
      <td class="px-5 py-4">
        <span class="px-2 py-0.5 rounded text-[9px] font-bold border status-${t.status}">
          ${t.status.replace("_", " ")}
        </span>
      </td>
      <td class="px-5 py-4 font-mono text-[10px] font-bold priority-${t.priority}">
        ${t.priority || "LOW"}
      </td>
      <td class="px-5 py-4 text-muted text-xs">${t.assignedAgent?.name || "Unassigned"}</td>
      <td class="px-5 py-4 text-[11px] text-muted font-mono">
        ${new Date(t.createdAt).toLocaleDateString("en-US")}
      </td>
    </tr>`,
    )
    .join("");
}

function updateStats(tickets) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("stat-all", tickets.length);
  set("stat-open", tickets.filter((t) => t.status === "OPEN").length);
  set("stat-in", tickets.filter((t) => t.status === "IN_PROGRESS").length);
  set("stat-resolved", tickets.filter((t) => t.status === "RESOLVED").length);
  set("stat-closed", tickets.filter((t) => t.status === "CLOSED").length);
}
