/* ============================================================
   tickets.js — full CRUD + search + filter for the tickets page.
   Depends on: api.js, ui.js (must be loaded first).
   ============================================================ */

// ── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_CLS = {
  'Open': 'badge--open',
  'In Progress': 'badge--progress',
  'Closed': 'badge--closed',
};
const PRIORITY_CLS = {
  'Critical': 'badge--critical',
  'High': 'badge--high',
  'Medium': 'badge--medium',
  'Low': 'badge--low',
};

function statusBadge(status) {
  const cls = STATUS_CLS[status] || 'badge--open';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}
function priorityBadge(priority) {
  const cls = PRIORITY_CLS[priority] || 'badge--medium';
  return `<span class="badge ${cls}">${escapeHtml(priority)}</span>`;
}

// ── State ────────────────────────────────────────────────────────────────────

const state = {
  keyword: '',
  status: '',
  priority: '',
  editingId: null,   // null = create mode, number = edit mode
  viewingId: null,
};

// ── DOM refs ─────────────────────────────────────────────────────────────────

const tbody = document.getElementById('ticketsBody');
const ticketCount = document.getElementById('ticketCount');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const btnClear = document.getElementById('btnClearFilters');
const btnNewTicket = document.getElementById('btnNewTicket');

// Ticket modal
const ticketOverlay = document.getElementById('ticketModalOverlay');
const ticketTitle = document.getElementById('ticketModalTitle');
const ticketSaveBtn = document.getElementById('ticketModalSave');
const fldCustomer = document.getElementById('ticketCustomer');
const fldSubject = document.getElementById('ticketSubject');
const fldDesc = document.getElementById('ticketDesc');
const fldPriority = document.getElementById('ticketPriority');
const fldStatus = document.getElementById('ticketStatus');
const rowCustomer = document.getElementById('rowCustomer');
const rowSubject = document.getElementById('rowSubject');

// View modal
const viewOverlay = document.getElementById('viewModalOverlay');
const viewTitle = document.getElementById('viewModalTitle');
const viewBody = document.getElementById('viewModalBody');
const viewEditBtn = document.getElementById('viewModalEdit');

// ── Load & render tickets ────────────────────────────────────────────────────

async function loadTickets() {
  tbody.innerHTML = `<tr><td colspan="7"><div class="state">Loading…</div></td></tr>`;
  ticketCount.textContent = '';

  try {
    let tickets;

    if (state.keyword.trim()) {
      tickets = await api.searchTickets(state.keyword.trim());
    } else {
      // Build query string for status + priority filters
      const params = new URLSearchParams();
      if (state.status) params.set('status', state.status);
      if (state.priority) params.set('priority', state.priority);
      const qs = params.toString();
      tickets = await (qs
        ? api.getTicketsFiltered(qs)
        : api.getTickets());
    }

    renderTable(tickets);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="state"><h3>Could not load tickets</h3><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function renderTable(tickets) {
  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="state"><h3>No tickets found</h3><p>Try adjusting your search or filters, or create a new ticket.</p></div></td></tr>`;
    ticketCount.textContent = '';
    return;
  }

  ticketCount.textContent = `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = tickets.map((t) => `
    <tr>
      <td class="id-tag">#${t.id}</td>
      <td>
        <button class="link-btn" data-action="view" data-id="${t.id}" title="View details">
          ${escapeHtml(t.subject)}
        </button>
      </td>
      <td>${escapeHtml(t.customer_name || '—')}</td>
      <td>${priorityBadge(t.priority)}</td>
      <td>${statusBadge(t.status)}</td>
      <td>${formatDate(t.created_at)}</td>
      <td>
        <div class="cell-actions">
          <button class="btn btn--ghost btn--sm" data-action="edit" data-id="${t.id}" title="Edit ticket">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn btn--danger btn--sm" data-action="delete" data-id="${t.id}" data-subject="${escapeHtml(t.subject)}" title="Delete ticket">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Populate customer dropdown ────────────────────────────────────────────────

async function populateCustomerDropdown(selectedId = null) {
  fldCustomer.innerHTML = '<option value="">— Select customer —</option>';
  try {
    const customers = await api.getCustomers();
    customers.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.email})`;
      if (selectedId && c.id === selectedId) opt.selected = true;
      fldCustomer.appendChild(opt);
    });
  } catch {
    fldCustomer.innerHTML = '<option value="">Could not load customers</option>';
  }
}

// ── Ticket modal helpers ──────────────────────────────────────────────────────

function clearValidation() {
  rowCustomer.classList.remove('has-error');
  rowSubject.classList.remove('has-error');
}

function validateForm() {
  let valid = true;
  clearValidation();
  if (!fldCustomer.value) { rowCustomer.classList.add('has-error'); valid = false; }
  if (!fldSubject.value.trim()) { rowSubject.classList.add('has-error'); valid = false; }
  return valid;
}

function openCreateModal() {
  state.editingId = null;
  ticketTitle.textContent = 'New Ticket';
  ticketSaveBtn.textContent = 'Create Ticket';
  clearValidation();
  fldSubject.value = '';
  fldDesc.value = '';
  fldPriority.value = 'Medium';
  fldStatus.value = 'Open';
  populateCustomerDropdown();
  ticketOverlay.classList.add('is-open');
  fldSubject.focus();
}

async function openEditModal(id) {
  state.editingId = id;
  ticketTitle.textContent = `Edit Ticket #${id}`;
  ticketSaveBtn.textContent = 'Save Changes';
  clearValidation();

  // Load ticket data and customer list in parallel
  ticketOverlay.classList.add('is-open');
  fldSubject.value = '';
  fldDesc.value = '';
  fldCustomer.innerHTML = '<option>Loading…</option>';

  try {
    const [ticket] = await Promise.all([
      api.getTicket(id),
      populateCustomerDropdown(),
    ]);
    fldCustomer.value = ticket.customer_id;
    fldSubject.value = ticket.subject;
    fldDesc.value = ticket.description || '';
    fldPriority.value = ticket.priority;
    fldStatus.value = ticket.status;
    fldSubject.focus();
  } catch (err) {
    showToast(`Could not load ticket: ${err.message}`, 'error');
    ticketOverlay.classList.remove('is-open');
  }
}

function closeTicketModal() {
  ticketOverlay.classList.remove('is-open');
  clearValidation();
}

// ── Save ticket (create or update) ───────────────────────────────────────────

async function saveTicket() {
  if (!validateForm()) return;

  const data = {
    customer_id: parseInt(fldCustomer.value, 10),
    subject: fldSubject.value.trim(),
    description: fldDesc.value.trim(),
    priority: fldPriority.value,
    status: fldStatus.value,
  };

  ticketSaveBtn.disabled = true;
  ticketSaveBtn.textContent = 'Saving…';

  try {
    if (state.editingId) {
      await api.updateTicket(state.editingId, data);
      showToast('Ticket updated successfully.', 'success');
    } else {
      await api.createTicket(data);
      showToast('Ticket created successfully.', 'success');
    }
    closeTicketModal();
    loadTickets();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    ticketSaveBtn.disabled = false;
    ticketSaveBtn.textContent = state.editingId ? 'Save Changes' : 'Create Ticket';
  }
}

// ── Delete ticket ─────────────────────────────────────────────────────────────

async function deleteTicket(id, subject) {
  if (!window.confirm(`Delete ticket #${id}: "${subject}"?\n\nThis action cannot be undone.`)) return;
  try {
    await api.deleteTicket(id);
    showToast('Ticket deleted.', 'success');
    loadTickets();
  } catch (err) {
    showToast(`Could not delete: ${err.message}`, 'error');
  }
}

// ── View ticket detail ────────────────────────────────────────────────────────

async function openViewModal(id) {
  state.viewingId = id;
  viewTitle.textContent = `Ticket #${id}`;
  viewBody.innerHTML = '<div class="state">Loading…</div>';
  viewOverlay.classList.add('is-open');

  try {
    const t = await api.getTicket(id);
    viewBody.innerHTML = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Subject</span>
          <span class="detail-value">${escapeHtml(t.subject)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Customer</span>
          <span class="detail-value">${escapeHtml(t.customer_name || '—')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Priority</span>
          <span class="detail-value">${priorityBadge(t.priority)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value">${statusBadge(t.status)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created</span>
          <span class="detail-value">${formatDate(t.created_at)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Last Updated</span>
          <span class="detail-value">${formatDate(t.updated_at)}</span>
        </div>
        ${t.description ? `
        <div class="detail-row detail-row--full">
          <span class="detail-label">Description</span>
          <p class="detail-desc">${escapeHtml(t.description)}</p>
        </div>` : ''}
      </div>
    `;
  } catch (err) {
    viewBody.innerHTML = `<div class="state"><h3>Error</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function closeViewModal() {
  viewOverlay.classList.remove('is-open');
  state.viewingId = null;
}

// ── Search (debounced) ────────────────────────────────────────────────────────

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.keyword = searchInput.value;
    // Clear status/priority filters when searching by keyword
    if (state.keyword.trim()) {
      filterStatus.value = '';
      filterPriority.value = '';
      state.status = '';
      state.priority = '';
    }
    loadTickets();
  }, 300);
});

// ── Filters ───────────────────────────────────────────────────────────────────

filterStatus.addEventListener('change', () => {
  state.status = filterStatus.value;
  state.keyword = '';
  searchInput.value = '';
  loadTickets();
});

filterPriority.addEventListener('change', () => {
  state.priority = filterPriority.value;
  state.keyword = '';
  searchInput.value = '';
  loadTickets();
});

btnClear.addEventListener('click', () => {
  state.keyword = '';
  state.status = '';
  state.priority = '';
  searchInput.value = '';
  filterStatus.value = '';
  filterPriority.value = '';
  loadTickets();
});

// ── New ticket button ─────────────────────────────────────────────────────────

btnNewTicket.addEventListener('click', openCreateModal);

// ── Modal close/cancel ────────────────────────────────────────────────────────

document.getElementById('ticketModalClose').addEventListener('click', closeTicketModal);
document.getElementById('ticketModalCancel').addEventListener('click', closeTicketModal);
ticketOverlay.addEventListener('click', (e) => { if (e.target === ticketOverlay) closeTicketModal(); });

document.getElementById('viewModalClose').addEventListener('click', closeViewModal);
document.getElementById('viewModalClose2').addEventListener('click', closeViewModal);
viewOverlay.addEventListener('click', (e) => { if (e.target === viewOverlay) closeViewModal(); });

ticketSaveBtn.addEventListener('click', saveTicket);

// ── View modal → open edit ────────────────────────────────────────────────────

viewEditBtn.addEventListener('click', () => {
  const id = state.viewingId;
  closeViewModal();
  openEditModal(id);
});

// ── Table event delegation ────────────────────────────────────────────────────

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  const action = btn.dataset.action;
  const subject = btn.dataset.subject || '';

  if (action === 'view') openViewModal(id);
  if (action === 'edit') openEditModal(id);
  if (action === 'delete') deleteTicket(id, subject);
});

// ── Keyboard accessibility ────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (ticketOverlay.classList.contains('is-open')) closeTicketModal();
    if (viewOverlay.classList.contains('is-open')) closeViewModal();
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────

loadTickets();
