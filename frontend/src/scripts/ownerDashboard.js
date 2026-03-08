// ── Mock data ──────────────────────────────────────────────
const mockWorkspaces = [
  { id: 1, name: 'Acme Corp',        status: 'ACTIVE',    plan: 'Enterprise', ticketsTotal: 412, ticketsOpen: 34, agents: 12, addonsActive: 5 },
  { id: 2, name: 'Globex Inc',       status: 'ACTIVE',    plan: 'Pro',        ticketsTotal: 178, ticketsOpen: 9,  agents: 4,  addonsActive: 2 },
  { id: 3, name: 'Initech LLC',      status: 'SUSPENDED', plan: 'Starter',    ticketsTotal: 65,  ticketsOpen: 0,  agents: 2,  addonsActive: 0 },
  { id: 4, name: 'Umbrella Ltd',     status: 'ACTIVE',    plan: 'Pro',        ticketsTotal: 290, ticketsOpen: 21, agents: 7,  addonsActive: 3 },
  { id: 5, name: 'Stark Industries', status: 'ACTIVE',    plan: 'Enterprise', ticketsTotal: 887, ticketsOpen: 58, agents: 20, addonsActive: 8 },
];

// ── State ──────────────────────────────────────────────────
let workspaces = [];

// ── Inline SVG icons ───────────────────────────────────────
const icons = {
  ticket: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 011 1v3a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 011-1h1a1 1 0 001-1V7a2 2 0 00-2-2H5z"/>
  </svg>`,

  trending: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
  </svg>`,

  puzzle: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>
  </svg>`,

  users: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>`,

  building: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>`,
};

// ── Compute totals from workspace array ────────────────────
function computeTotals(ws) {
  return ws.reduce(
    (acc, w) => ({
      tickets: acc.tickets + w.ticketsTotal,
      open:    acc.open    + w.ticketsOpen,
      addons:  acc.addons  + w.addonsActive,
      agents:  acc.agents  + w.agents,
    }),
    { tickets: 0, open: 0, addons: 0, agents: 0 }
  );
}

// ── Render stats cards ─────────────────────────────────────
function renderStats(ws) {
  const t = computeTotals(ws);

  const defs = [
    { label: 'Total Tickets',  value: t.tickets, icon: icons.ticket,   color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: 'Open Tickets',   value: t.open,    icon: icons.trending, color: 'text-warn',    bg: 'bg-warn/10',    border: 'border-warn/20'    },
    { label: 'Active Add-ons', value: t.addons,  icon: icons.puzzle,   color: 'text-accent',  bg: 'bg-accent/10',  border: 'border-accent/20'  },
    { label: 'Total Agents',   value: t.agents,  icon: icons.users,    color: 'text-info',    bg: 'bg-info/10',    border: 'border-info/20'    },
  ];

  document.getElementById('stats-grid').innerHTML = defs.map(s => `
    <div class="stat-card bg-card border ${s.border} rounded-xl p-5 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-30 ${s.bg}"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-3">
          <span class="${s.color}">${s.icon}</span>
          <span class="text-[10px] font-mono text-muted uppercase tracking-widest">${s.label}</span>
        </div>
        <p class="font-display text-3xl font-bold text-fg">${s.value.toLocaleString()}</p>
      </div>
    </div>
  `).join('');
}

// ── Render status badge ────────────────────────────────────
function statusBadge(status) {
  const active = status === 'ACTIVE';
  return `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider
      ${active
        ? 'bg-accent/10 text-accent border border-accent/25'
        : 'bg-warn/10 text-warn border border-warn/25'}">
      <span class="w-1.5 h-1.5 rounded-full ${active ? 'bg-accent' : 'bg-warn'}"></span>
      ${status}
    </span>`;
}

// ── Render workspace table rows ────────────────────────────
function renderTable() {
  document.getElementById('ws-tbody').innerHTML = workspaces.map(ws => `
    <tr class="ws-row border-b border-border last:border-0 cursor-default" data-id="${ws.id}">
      <td class="px-6 py-3">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            ${icons.building}
          </div>
          <span class="font-display font-semibold text-fg text-sm">${ws.name}</span>
        </div>
      </td>
      <td class="px-6 py-3">${statusBadge(ws.status)}</td>
      <td class="px-6 py-3 font-mono text-xs text-muted">${ws.plan}</td>
      <td class="px-6 py-3 font-mono text-sm text-fg">${ws.ticketsTotal.toLocaleString()}</td>
      <td class="px-6 py-3 font-mono text-sm text-fg">${ws.ticketsOpen}</td>
      <td class="px-6 py-3 font-mono text-sm text-fg">${ws.agents}</td>
      <td class="px-6 py-3">
        <button
          class="toggle-btn px-3 py-1.5 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all duration-150
            ${ws.status === 'ACTIVE'
              ? 'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20'
              : 'bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20'}"
          data-id="${ws.id}">
          ${ws.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </button>
      </td>
    </tr>
  `).join('');
}

// ── Toggle workspace status ────────────────────────────────
function toggleStatus(id) {
  workspaces = workspaces.map(ws =>
    ws.id === id
      ? { ...ws, status: ws.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
      : ws
  );
  renderStats(workspaces);
  renderTable();
}

// ── Event delegation for toggle buttons ───────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  toggleStatus(parseInt(btn.dataset.id));
});

// ── Simulate async fetch & initialise ─────────────────────
async function init() {
  document.getElementById('loader').classList.remove('hidden');
  await new Promise(resolve => setTimeout(resolve, 600));
  workspaces = mockWorkspaces;
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('table-wrap').classList.remove('hidden');
  renderStats(workspaces);
  renderTable();
}

init();

// ── Expose shared state globally ──────────────────────────
// workspaces.js reads/writes window.workspaces
Object.defineProperty(window, 'workspaces', {
  get: () => workspaces,
  set: v  => { workspaces = v; },
  configurable: true,
});

// ── Page routing via sidebar events ───────────────────────
document.addEventListener('pagechange', ({ detail }) => {
  const dashPage = document.getElementById('dashboard-page');
  const wsPage   = document.getElementById('ws-page');

  if (detail.page === 'dashboard') {
    dashPage.classList.remove('hidden');
    wsPage.classList.add('hidden');
    // Refresh stats in case workspaces were added
    renderStats(window.workspaces || workspaces);
    renderTable();
  } else if (detail.page === 'workspaces') {
    dashPage.classList.add('hidden');
    wsPage.classList.remove('hidden');
    Workspaces.mount();
  }
});

// ── Re-render dashboard stats when workspaces change ──────
document.addEventListener('workspacesUpdated', () => {
  workspaces = window.workspaces || workspaces;
  renderStats(workspaces);
  renderTable();
});