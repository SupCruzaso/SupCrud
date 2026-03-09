// ── sidebar.js ─────────────────────────────────────────────
// Handles sidebar navigation state and logout interaction.
// Exposes window.Sidebar for other modules to consume.
// Note: page headers are owned by each page module — this
// file only manages nav highlight state + routing events.

const Sidebar = (() => {

  let currentPage = 'dashboard';

  // ── Set active nav item & fire routing event ─────────────
  function setActive(page) {
    currentPage = page;

    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    document.dispatchEvent(new CustomEvent('pagechange', { detail: { page } }));
  }

  // ── Handle nav clicks ────────────────────────────────────
  function onNavClick(e) {
    const item = e.target.closest('.nav-item[data-page]');
    if (!item) return;
    e.preventDefault();
    setActive(item.dataset.page);
  }

  // ── Handle logout ────────────────────────────────────────
  function onLogout(e) {
    e.preventDefault();
    const btn = document.getElementById('logout-btn');
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      alert('Logged out. (Hook this to your auth flow.)');
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    }, 300);
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    document.querySelector('.sidebar-nav').addEventListener('click', onNavClick);
    document.getElementById('logout-btn').addEventListener('click', onLogout);
    setActive(currentPage);
  }

  return { init, setActive, getCurrentPage: () => currentPage };
})();

document.addEventListener('DOMContentLoaded', () => Sidebar.init());