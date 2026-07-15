/* ============================================================
   ui.js — small shared UI helpers used across every page.
   ============================================================ */

/** Show a short-lived toast message. type: 'success' | 'error' | 'info' */
function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast is-visible ${type === 'error' ? 'is-error' : type === 'success' ? 'is-success' : ''}`;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3200);
}

/** Highlight the sidebar link matching the current page. */
function markActiveNav() {
  const current = document.body.dataset.page;
  document.querySelectorAll('.nav__link').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.page === current);
  });
}

/** Escape user-provided text before inserting into innerHTML. */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/** Format an ISO date string for display; falls back to '—'. */
function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

document.addEventListener('DOMContentLoaded', markActiveNav);
