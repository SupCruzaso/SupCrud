/**
 * SupCrud Agents Management - Backend Integrated
 * Handles real-time agent listing, invitations, and workspace stats.
 */

const API_BASE = window.API_BASE || "http://localhost:3000";
const token = localStorage.getItem("token");
const workspaceId = localStorage.getItem("selectedWorkspaceId");

// ── Central headers — workspaceGuard requires x-workspace-id ─
const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-workspace-id": workspaceId,
});

document.addEventListener("DOMContentLoaded", async () => {
  if (!token || !workspaceId) {
    window.location.href = "login.html";
    return;
  }
  injectToastContainer();
  await refreshAllData();
  setupEventListeners();
});

// ── Toast Notification System ────────────────────────────────
function injectToastContainer() {
  if (document.getElementById("sc-toast-container")) return;
  const container = document.createElement("div");
  container.id = "sc-toast-container";
  container.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  `;
  document.body.appendChild(container);
}

function showToast(message, type = "info") {
  const colors = {
    success: { bg: "#0f2a1e", border: "#22c55e", text: "#22c55e", icon: "✓" },
    error: { bg: "#2a0f0f", border: "#ef4444", text: "#ef4444", icon: "✕" },
    info: { bg: "#0f1a2a", border: "#6366f1", text: "#6366f1", icon: "ℹ" },
    warn: { bg: "#2a1f0f", border: "#f59e0b", text: "#f59e0b", icon: "⚠" },
  };
  const c = colors[type] || colors.info;
  const container = document.getElementById("sc-toast-container");

  const toast = document.createElement("div");
  toast.style.cssText = `
    display: flex; align-items: center; gap: 12px;
    background: ${c.bg}; border: 1px solid ${c.border}33;
    border-left: 3px solid ${c.border};
    padding: 14px 18px; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: #cbd5e1; max-width: 340px;
    animation: scToastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
    backdrop-filter: blur(8px);
  `;

  toast.innerHTML = `
    <span style="font-size:15px; color:${c.text}; flex-shrink:0;">${c.icon}</span>
    <span style="flex:1; line-height:1.5;">${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background:none; border:none; color:#64748b; cursor:pointer;
      font-size:14px; padding:0; line-height:1; flex-shrink:0;
    ">✕</button>
  `;

  if (!document.getElementById("sc-toast-styles")) {
    const style = document.createElement("style");
    style.id = "sc-toast-styles";
    style.textContent = `
      @keyframes scToastIn {
        from { opacity: 0; transform: translateX(20px) scale(0.95); }
        to   { opacity: 1; transform: translateX(0)    scale(1);    }
      }
      @keyframes scToastOut {
        from { opacity: 1; transform: translateX(0)    scale(1);    }
        to   { opacity: 0; transform: translateX(20px) scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "scToastOut 0.25s ease forwards";
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ── Data Loading ─────────────────────────────────────────────
async function refreshAllData() {
  document.getElementById("agents-tbody").innerHTML = `
    <tr>
      <td colspan="5" class="py-10 text-center animate-pulse font-mono text-[10px] text-muted">
        FETCHING AGENTS...
      </td>
    </tr>`;

  try {
    const response = await fetch(
      `${API_BASE}/api/workspaces/${workspaceId}/agents`,
      { method: "GET", headers: authHeaders() },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Server responded with status ${response.status}`,
      );
    }

    const data = await response.json();
    renderAgents(data.agents || []);
    renderInvites(data.invites || []);
    updateStats(data);
  } catch (error) {
    console.error("[Agents] Fetch error:", error.message);
    showTableError("Failed to load agents. Check your connection.");
    showToast("Could not load agents from server.", "error");
  }
}

// ── Render Agents ─────────────────────────────────────────────
function renderAgents(agentsList) {
  const tbody = document.getElementById("agents-tbody");

  if (agentsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-10 text-center font-mono text-[10px] text-muted">
          NO AGENTS FOUND
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = agentsList
    .map(
      (a) => `
    <tr class="border-b border-border/50 hover:bg-surface/30 transition-colors">
      <td class="px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary text-[10px] font-bold">
            ${getInitials(a.name || a.email)}
          </div>
          <div>
            <p class="font-display font-semibold text-fg text-sm">${a.name || "Pending Name"}</p>
            <p class="text-[11px] font-mono text-muted">${a.email}</p>
          </div>
        </div>
      </td>
      <td class="px-5 py-4">
        <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
          a.role === "ADMIN"
            ? "bg-warn/10 text-warn border border-warn/25"
            : "bg-info/10 text-info border border-info/25"
        }">
          ${a.role}
        </span>
      </td>
      <td class="px-5 py-4">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-accent/10 text-accent border border-accent/25">
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>ACTIVE
        </span>
      </td>
      <td class="px-5 py-4 font-mono text-xs text-fg">${a.openTicketsCount || 0}</td>
      <td class="px-5 py-4">
        <button
          class="text-[10px] font-mono text-muted hover:text-red-400 transition-colors uppercase tracking-tighter"
          onclick="removeAgent('${a.userId || a.id}')">
          Remove
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// ── Render Pending Invites ────────────────────────────────────
function renderInvites(invitesList) {
  const container = document.getElementById("invites-list");
  const section = document.getElementById("pending-section");

  if (invitesList.length > 0) {
    section.classList.remove("hidden");
    document.getElementById("invite-badge").textContent = invitesList.length;
    container.innerHTML = invitesList
      .map(
        (inv) => `
      <div class="flex items-center justify-between bg-card border border-warn/20 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-warn/10 border border-warn/20 flex items-center justify-center text-warn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs font-mono text-fg">${inv.email}</p>
            <p class="text-[10px] font-mono text-muted uppercase">
              Role: ${inv.role} · Expires: ${new Date(inv.expiresAt).toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
        <button onclick="revokeInvite('${inv.id}')"
          class="text-[10px] font-mono text-muted hover:text-red-400 transition-colors uppercase">
          Revoke
        </button>
      </div>
    `,
      )
      .join("");
  } else {
    section.classList.add("hidden");
  }
}

// ── API Actions ───────────────────────────────────────────────
async function sendInvitation() {
  const email = document.getElementById("invite-email").value.trim();
  const role = document.getElementById("invite-role").value;
  const btn = document.getElementById("send-invite");

  if (!email) {
    showToast("Please enter a valid email address.", "warn");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("The email address format is invalid.", "warn");
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "SENDING...";

    const response = await fetch(
      `${API_BASE}/api/workspaces/${workspaceId}/invitations`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email, role }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      closeModal();
      document.getElementById("invite-email").value = "";
      showToast(`Invitation sent to ${email} successfully.`, "success");
      await refreshAllData();
    } else {
      showToast(
        data.error || "Failed to send invitation. Please try again.",
        "error",
      );
    }
  } catch (error) {
    console.error("[Agents] Invite error:", error.message);
    showToast("Connection error. Could not send the invitation.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "SEND INVITE";
  }
}

async function removeAgent(agentId) {
  const confirmed = await showConfirmToast(
    "Remove this agent from the workspace?",
  );
  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/workspaces/${workspaceId}/agents/${agentId}`,
      { method: "DELETE", headers: authHeaders() },
    );

    if (response.ok) {
      showToast("Agent removed from workspace.", "success");
      await refreshAllData();
    } else {
      const data = await response.json().catch(() => ({}));
      showToast(data.error || "Failed to remove agent.", "error");
    }
  } catch (err) {
    showToast("Connection error. Could not remove the agent.", "error");
  }
}

async function revokeInvite(inviteId) {
  const confirmed = await showConfirmToast("Revoke this pending invitation?");
  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/workspaces/${workspaceId}/invitations/${inviteId}`,
      { method: "DELETE", headers: authHeaders() },
    );

    if (response.ok) {
      showToast("Invitation revoked.", "success");
      await refreshAllData();
    } else {
      showToast("Failed to revoke invitation.", "error");
    }
  } catch (err) {
    showToast("Connection error. Could not revoke invitation.", "error");
  }
}

// ── Confirm Toast ─────────────────────────────────────────────
function showConfirmToast(message) {
  return new Promise((resolve) => {
    const container = document.getElementById("sc-toast-container");
    const toast = document.createElement("div");
    toast.style.cssText = `
      display: flex; flex-direction: column; gap: 12px;
      background: #0f1521; border: 1px solid #334155;
      border-left: 3px solid #ef4444; padding: 16px 18px; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: #cbd5e1; max-width: 300px;
      animation: scToastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
    `;
    toast.innerHTML = `
      <p style="color:#f1f5f9; line-height:1.5;">${message}</p>
      <div style="display:flex; gap:8px; justify-content:flex-end;">
        <button id="confirm-no" style="padding:6px 14px; border-radius:8px; border:1px solid #334155;
          background:transparent; color:#94a3b8; font-size:10px; font-family:inherit;
          cursor:pointer; text-transform:uppercase;">Cancel</button>
        <button id="confirm-yes" style="padding:6px 14px; border-radius:8px; border:none;
          background:#ef4444; color:white; font-size:10px; font-family:inherit;
          cursor:pointer; text-transform:uppercase; font-weight:700;">Confirm</button>
      </div>
    `;
    container.appendChild(toast);
    toast.querySelector("#confirm-yes").onclick = () => {
      toast.remove();
      resolve(true);
    };
    toast.querySelector("#confirm-no").onclick = () => {
      toast.remove();
      resolve(false);
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────
function getInitials(name) {
  return name
    .split("@")[0]
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function updateStats(data) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("count-total", data.agents?.length || 0);
  set(
    "count-active",
    data.agents?.filter((a) => a.active)?.length ?? data.agents?.length ?? 0,
  );
  set("count-pending", data.invites?.length || 0);
}

function setupEventListeners() {
  document
    .getElementById("invite-btn")
    ?.addEventListener("click", () =>
      document.getElementById("invite-modal").classList.remove("hidden"),
    );
  document
    .getElementById("close-invite")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("cancel-invite")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("send-invite")
    ?.addEventListener("click", sendInvitation);
}

function closeModal() {
  document.getElementById("invite-modal").classList.add("hidden");
}

function showTableError(msg) {
  document.getElementById("agents-tbody").innerHTML = `
    <tr>
      <td colspan="5" class="py-10 text-center text-red-400 font-mono text-[10px]">
        ${msg.toUpperCase()}
      </td>
    </tr>`;
}
