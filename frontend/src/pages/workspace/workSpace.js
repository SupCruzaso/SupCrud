// ── workspaces.js ──────────────────────────────────────────
// Handles the Workspaces page: grid cards, search, and the
// "Create Workspace" modal. Reads/writes the shared
// window.workspaces array owned by dashboard.js.

const Workspaces = (() => {

  // ── Local state ────────────────────────────────────────────
  let search   = '';
  let modalOpen = false;
  let creating  = false;
  let form      = { name: '', plan: 'Free' };

  // ── Shared icons (building reused from dashboard) ──────────
  const iconBuilding = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>`;

  // ── Status badge (mirrors dashboard.js helper) ─────────────
  function statusBadge(status) {
    const active = status === 'ACTIVE';
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider
        ${active ? 'bg-accent/10 text-accent border border-accent/25' : 'bg-warn/10 text-warn border border-warn/25'}">
        <span class="w-1.5 h-1.5 rounded-full ${active ? 'bg-accent' : 'bg-warn'}"></span>
        ${status}
      </span>`;
  }

  // ── Render the workspaces page ─────────────────────────────
  function render() {
    const ws = window.workspaces || [];
    const filtered = ws.filter(w =>
      w.name.toLowerCase().includes(search.toLowerCase())
    );

    document.getElementById('ws-page').innerHTML = `

      <!-- Header row -->
      <div class="flex items-center justify-between mb-6 fade-up">
        <div>
          <p class="text-xs text-muted uppercase tracking-[0.2em] mb-1 font-mono">Manage</p>
          <h1 class="font-display text-3xl font-bold text-fg">Workspaces</h1>
        </div>
        <button id="open-modal-btn"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-mono text-xs font-medium
                 tracking-wider uppercase border border-primary/50 hover:bg-primary/90 transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Workspace
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-6 max-w-sm">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
          </svg>
        </span>
        <input
          id="ws-search"
          type="text"
          placeholder="Search workspaces..."
          value="${search}"
          class="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm font-mono text-fg placeholder-muted
                 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${filtered.length > 0 ? filtered.map(ws => `
          <div class="ws-card bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors duration-150">

            <!-- Card header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  ${iconBuilding}
                </div>
                <div>
                  <h3 class="font-display font-semibold text-fg text-sm">${ws.name}</h3>
                  <p class="text-[11px] font-mono text-muted mt-0.5">${ws.plan} plan</p>
                </div>
              </div>
              ${statusBadge(ws.status)}
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-surface rounded-lg py-2 border border-border">
                <p class="font-display text-lg font-bold text-fg">${ws.ticketsTotal}</p>
                <p class="text-[10px] font-mono text-muted uppercase tracking-wider">Tickets</p>
              </div>
              <div class="bg-surface rounded-lg py-2 border border-border">
                <p class="font-display text-lg font-bold text-fg">${ws.agents}</p>
                <p class="text-[10px] font-mono text-muted uppercase tracking-wider">Agents</p>
              </div>
              <div class="bg-surface rounded-lg py-2 border border-border">
                <p class="font-display text-lg font-bold text-fg">${ws.addonsActive}</p>
                <p class="text-[10px] font-mono text-muted uppercase tracking-wider">Add-ons</p>
              </div>
            </div>

            <!-- Toggle button -->
            <button
              class="toggle-btn w-full py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all duration-150
                ${ws.status === 'ACTIVE'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20'
                  : 'bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20'}"
              data-id="${ws.id}">
              ${ws.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </button>

          </div>
        `).join('') : `
          <div class="col-span-full text-center py-16 text-muted font-mono text-sm">
            No workspaces found.
          </div>
        `}
      </div>

      <!-- Modal -->
      <div id="ws-modal" class="modal-overlay ${modalOpen ? '' : 'hidden'}">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="font-display font-semibold text-fg text-base">Create Workspace</h2>
            <button id="close-modal-btn" class="text-muted hover:text-fg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Name field -->
            <div class="field-group">
              <label class="field-label">Workspace Name</label>
              <input
                id="form-name"
                type="text"
                placeholder="e.g. Acme Corp"
                value="${form.name}"
                class="field-input"
              />
            </div>

            <!-- Plan select -->
            <div class="field-group">
              <label class="field-label">Plan</label>
              <select id="form-plan" class="field-input field-select">
                <option value="Free"       ${form.plan === 'Free'       ? 'selected' : ''}>Free</option>
                <option value="Pro"        ${form.plan === 'Pro'        ? 'selected' : ''}>Pro</option>
                <option value="Business"   ${form.plan === 'Business'   ? 'selected' : ''}>Business</option>
                <option value="Enterprise" ${form.plan === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button id="cancel-modal-btn"
              class="px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider text-muted
                     border border-border hover:bg-surface transition-colors duration-150">
              Cancel
            </button>
            <button id="submit-modal-btn"
              class="px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider
                     bg-primary text-white border border-primary/50 hover:bg-primary/90 transition-colors duration-150
                     disabled:opacity-40 disabled:pointer-events-none"
              ${creating || !form.name.trim() ? 'disabled' : ''}>
              ${creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  // ── Bind events after render ───────────────────────────────
  function bindEvents() {
    // Search input
    const searchEl = document.getElementById('ws-search');
    if (searchEl) {
      searchEl.addEventListener('input', e => {
        search = e.target.value;
        render();
      });
      // Keep focus after re-render
      searchEl.focus();
      searchEl.setSelectionRange(search.length, search.length);
    }

    // Open modal
    document.getElementById('open-modal-btn')?.addEventListener('click', () => {
      modalOpen = true;
      form = { name: '', plan: 'Free' };
      render();
    });

    // Close modal buttons
    document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn')?.addEventListener('click', closeModal);

    // Close modal on overlay click
    document.getElementById('ws-modal')?.addEventListener('click', e => {
      if (e.target.id === 'ws-modal') closeModal();
    });

    // Sync form fields
    document.getElementById('form-name')?.addEventListener('input', e => {
      form.name = e.target.value;
      syncSubmitBtn();
    });
    document.getElementById('form-plan')?.addEventListener('change', e => {
      form.plan = e.target.value;
    });

    // Submit
    document.getElementById('submit-modal-btn')?.addEventListener('click', handleCreate);

    // Toggle status buttons (cards)
    document.querySelectorAll('#ws-page .toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        // Mutate shared state via dashboard's toggleStatus
        if (typeof toggleStatus === 'function') toggleStatus(id);
        render();
      });
    });
  }

  // ── Sync submit button disabled state without full re-render
  function syncSubmitBtn() {
    const btn = document.getElementById('submit-modal-btn');
    if (!btn) return;
    btn.disabled = creating || !form.name.trim();
  }

  // ── Close modal ────────────────────────────────────────────
  function closeModal() {
    modalOpen = false;
    form = { name: '', plan: 'Free' };
    render();
  }

  // ── Create new workspace ───────────────────────────────────
  async function handleCreate() {
    if (!form.name.trim() || creating) return;
    creating = true;
    render();

    // Simulate async save
    await new Promise(r => setTimeout(r, 700));

    const newWs = {
      id:           Date.now(),
      name:         form.name.trim(),
      plan:         form.plan,
      status:       'ACTIVE',
      ticketsTotal: 0,
      ticketsOpen:  0,
      agents:       0,
      addonsActive: 0,
    };

    window.workspaces = [...(window.workspaces || []), newWs];

    creating  = false;
    modalOpen = false;
    form      = { name: '', plan: 'Free' };

    render();

    // Also refresh dashboard stats if it's listening
    document.dispatchEvent(new CustomEvent('workspacesUpdated'));
  }

  // ── Public: mount the page ─────────────────────────────────
  function mount() {
    search    = '';
    modalOpen = false;
    render();
  }

  return { mount };
})();