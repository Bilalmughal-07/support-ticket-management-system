/* ============================================================
   customers.js — full CRUD for the customers page.
   Depends on: api.js, ui.js (must be loaded first).
   ============================================================ */

// ── State ────────────────────────────────────────────────────────────────────

const state = {
  allCustomers: [],   // master list fetched from API
  ticketCounts: {},   // { customerId: count }
  keyword:   '',
  editingId: null,    // null = create mode, number = edit mode
  viewingId: null,
};

// ── DOM refs ─────────────────────────────────────────────────────────────────

const tbody       = document.getElementById('customersBody');
const countEl     = document.getElementById('customerCount');
const searchInput = document.getElementById('customerSearch');
const btnClear    = document.getElementById('btnClearCustomerSearch');
const btnNew      = document.getElementById('btnNewCustomer');

// Customer modal
const custOverlay = document.getElementById('customerModalOverlay');
const custTitle   = document.getElementById('customerModalTitle');
const custSaveBtn = document.getElementById('customerModalSave');
const fldName     = document.getElementById('custName');
const fldEmail    = document.getElementById('custEmail');
const fldPhone    = document.getElementById('custPhone');
const fldCompany  = document.getElementById('custCompany');
const rowName     = document.getElementById('rowCustName');
const rowEmail    = document.getElementById('rowCustEmail');
const errName     = document.getElementById('errCustName');
const errEmail    = document.getElementById('errCustEmail');

// View modal
const viewOverlay = document.getElementById('viewCustOverlay');
const viewTitle   = document.getElementById('viewCustTitle');
const viewBody    = document.getElementById('viewCustBody');
const viewEditBtn = document.getElementById('viewCustEdit');

// ── Load & render ─────────────────────────────────────────────────────────────

async function loadCustomers() {
  tbody.innerHTML = `<tr><td colspan="7"><div class="state">Loading…</div></td></tr>`;
  countEl.textContent = '';

  try {
    // Fetch customers and all tickets in parallel — count tickets client-side
    const [customers, tickets] = await Promise.all([
      api.getCustomers(),
      api.getTickets().catch(() => []),
    ]);

    // Build ticket count map { customerId → count }
    state.ticketCounts = {};
    tickets.forEach((t) => {
      state.ticketCounts[t.customer_id] = (state.ticketCounts[t.customer_id] || 0) + 1;
    });

    state.allCustomers = customers;
    renderFiltered();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="state"><h3>Could not load customers</h3><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function renderFiltered() {
  const kw = state.keyword.trim().toLowerCase();
  const filtered = kw
    ? state.allCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.email.toLowerCase().includes(kw) ||
          (c.company || '').toLowerCase().includes(kw)
      )
    : state.allCustomers;

  renderTable(filtered);
}

function renderTable(customers) {
  if (!customers || customers.length === 0) {
    const msg = state.keyword
      ? 'No customers match your search.'
      : 'No customers yet. Click "Add Customer" to get started.';
    tbody.innerHTML = `<tr><td colspan="7"><div class="state"><h3>No customers found</h3><p>${escapeHtml(msg)}</p></div></td></tr>`;
    countEl.textContent = '';
    return;
  }

  countEl.textContent = `${customers.length} customer${customers.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = customers.map((c) => {
    const count = state.ticketCounts[c.id] || 0;
    const chipClass = count === 0 ? 'ticket-chip is-zero' : 'ticket-chip';
    return `
      <tr>
        <td class="id-tag">#${c.id}</td>
        <td>
          <button class="link-btn" data-action="view" data-id="${c.id}" title="View customer">
            ${escapeHtml(c.name)}
          </button>
        </td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone || '—')}</td>
        <td>${escapeHtml(c.company || '—')}</td>
        <td><span class="${chipClass}" title="${count} ticket${count !== 1 ? 's' : ''}">${count}</span></td>
        <td>
          <div class="cell-actions">
            <button class="btn btn--ghost btn--sm" data-action="edit" data-id="${c.id}" title="Edit customer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="btn btn--danger btn--sm" data-action="delete" data-id="${c.id}" data-name="${escapeHtml(c.name)}" data-tickets="${count}" title="Delete customer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Search ────────────────────────────────────────────────────────────────────

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.keyword = searchInput.value;
    renderFiltered();
  }, 250);
});

btnClear.addEventListener('click', () => {
  state.keyword     = '';
  searchInput.value = '';
  renderFiltered();
});

// ── Form validation ───────────────────────────────────────────────────────────

function clearValidation() {
  rowName.classList.remove('has-error');
  rowEmail.classList.remove('has-error');
  errName.textContent  = 'Name is required.';
  errEmail.textContent = 'A valid email address is required.';
}

function validateForm() {
  let valid = true;
  clearValidation();

  if (!fldName.value.trim()) {
    rowName.classList.add('has-error');
    valid = false;
  }

  const emailVal = fldEmail.value.trim();
  if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    rowEmail.classList.add('has-error');
    valid = false;
  }

  return valid;
}

// ── Customer modal helpers ────────────────────────────────────────────────────

function openCreateModal() {
  state.editingId          = null;
  custTitle.textContent    = 'Add Customer';
  custSaveBtn.textContent  = 'Add Customer';
  clearValidation();
  fldName.value    = '';
  fldEmail.value   = '';
  fldPhone.value   = '';
  fldCompany.value = '';
  custOverlay.classList.add('is-open');
  fldName.focus();
}

function openEditModal(id) {
  const customer = state.allCustomers.find((c) => c.id === id);
  if (!customer) {
    showToast('Customer not found. Please refresh the page.', 'error');
    return;
  }

  state.editingId          = id;
  custTitle.textContent    = `Edit Customer #${id}`;
  custSaveBtn.textContent  = 'Save Changes';
  clearValidation();

  fldName.value    = customer.name;
  fldEmail.value   = customer.email;
  fldPhone.value   = customer.phone    || '';
  fldCompany.value = customer.company  || '';

  custOverlay.classList.add('is-open');
  fldName.focus();
}

function closeCustomerModal() {
  custOverlay.classList.remove('is-open');
  clearValidation();
}

// ── Save customer (create or update) ─────────────────────────────────────────

async function saveCustomer() {
  if (!validateForm()) return;

  const data = {
    name:    fldName.value.trim(),
    email:   fldEmail.value.trim().toLowerCase(),
    phone:   fldPhone.value.trim()   || null,
    company: fldCompany.value.trim() || null,
  };

  custSaveBtn.disabled    = true;
  custSaveBtn.textContent = 'Saving…';

  try {
    if (state.editingId) {
      await api.updateCustomer(state.editingId, data);
      showToast('Customer updated successfully.', 'success');
    } else {
      await api.createCustomer(data);
      showToast('Customer added successfully.', 'success');
    }
    closeCustomerModal();
    loadCustomers();
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('already exists')) {
      rowEmail.classList.add('has-error');
      errEmail.textContent = err.message;
    } else {
      showToast(`Error: ${err.message}`, 'error');
    }
  } finally {
    custSaveBtn.disabled    = false;
    custSaveBtn.textContent = state.editingId ? 'Save Changes' : 'Add Customer';
  }
}

// ── Delete customer ───────────────────────────────────────────────────────────

async function deleteCustomer(id, name, ticketCount) {
  let message = `Delete customer "${name}" (ID #${id})?`;
  if (ticketCount > 0) {
    message += `\n\n⚠️ Warning: This customer has ${ticketCount} open ticket${ticketCount !== 1 ? 's' : ''}. All associated tickets will also be permanently deleted.`;
  }
  message += '\n\nThis action cannot be undone.';
  if (!window.confirm(message)) return;

  try {
    await api.deleteCustomer(id);
    showToast(`Customer "${name}" deleted.`, 'success');
    loadCustomers();
  } catch (err) {
    showToast(`Could not delete: ${err.message}`, 'error');
  }
}

// ── View customer detail ──────────────────────────────────────────────────────

function openViewModal(id) {
  const customer = state.allCustomers.find((c) => c.id === id);
  if (!customer) {
    showToast('Customer not found. Please refresh the page.', 'error');
    return;
  }

  state.viewingId = id;
  viewTitle.textContent = `Customer #${id}`;
  const count = state.ticketCounts[id] || 0;

  viewBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-row">
        <span class="detail-label">Name</span>
        <span class="detail-value">${escapeHtml(customer.name)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${escapeHtml(customer.email)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone</span>
        <span class="detail-value">${escapeHtml(customer.phone || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Company</span>
        <span class="detail-value">${escapeHtml(customer.company || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tickets</span>
        <span class="detail-value">
          <span class="${count === 0 ? 'ticket-chip is-zero' : 'ticket-chip'}">${count}</span>
          <a href="tickets.html" class="btn btn--ghost btn--sm" style="margin-left:8px">View Tickets</a>
        </span>
      </div>
    </div>
  `;

  viewOverlay.classList.add('is-open');
}

function closeViewModal() {
  viewOverlay.classList.remove('is-open');
  state.viewingId = null;
}

// ── Event wiring ──────────────────────────────────────────────────────────────

btnNew.addEventListener('click', openCreateModal);

document.getElementById('customerModalClose').addEventListener('click',  closeCustomerModal);
document.getElementById('customerModalCancel').addEventListener('click', closeCustomerModal);
custOverlay.addEventListener('click', (e) => { if (e.target === custOverlay) closeCustomerModal(); });

custSaveBtn.addEventListener('click', saveCustomer);

[fldName, fldEmail, fldPhone, fldCompany].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveCustomer();
  });
});

document.getElementById('viewCustClose').addEventListener('click',  closeViewModal);
document.getElementById('viewCustClose2').addEventListener('click', closeViewModal);
viewOverlay.addEventListener('click', (e) => { if (e.target === viewOverlay) closeViewModal(); });

viewEditBtn.addEventListener('click', () => {
  const id = state.viewingId;
  closeViewModal();
  openEditModal(id);
});

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id          = parseInt(btn.dataset.id, 10);
  const action      = btn.dataset.action;
  const name        = btn.dataset.name    || '';
  const ticketCount = parseInt(btn.dataset.tickets || '0', 10);

  if (action === 'view')   openViewModal(id);
  if (action === 'edit')   openEditModal(id);
  if (action === 'delete') deleteCustomer(id, name, ticketCount);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (custOverlay.classList.contains('is-open')) closeCustomerModal();
    if (viewOverlay.classList.contains('is-open')) closeViewModal();
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────

loadCustomers();
