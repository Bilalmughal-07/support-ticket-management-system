/* ============================================================
   dashboard.js — populates the summary cards and recent tickets
   table on index.html from the live API.
   ============================================================ */

const STATUS_BADGE = {
  'Open': 'badge--open',
  'In Progress': 'badge--progress',
  'Closed': 'badge--closed',
};

const PRIORITY_BADGE = {
  'High': 'badge--high',
  'Medium': 'badge--medium',
  'Low': 'badge--low',
};

function renderStatusBadge(status) {
  const cls = STATUS_BADGE[status] || 'badge--open';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function renderPriorityBadge(priority) {
  const cls = PRIORITY_BADGE[priority] || 'badge--medium';
  return `<span class="badge ${cls}">${escapeHtml(priority)}</span>`;
}

async function loadStats() {
  try {
    const stats = await api.getTicketStats();
    // Backend may return either {open, inProgress, closed} or an array of
    // {status, count} rows — normalize both shapes defensively.
    let open = 0, inProgress = 0, closed = 0;

    if (Array.isArray(stats)) {
      stats.forEach((row) => {
        const status = (row.status || '').toLowerCase();
        if (status === 'open') open = row.count;
        else if (status === 'in progress') inProgress = row.count;
        else if (status === 'closed') closed = row.count;
      });
    } else if (stats) {
      open = stats.open ?? stats.Open ?? 0;
      inProgress = stats.inProgress ?? stats['In Progress'] ?? 0;
      closed = stats.closed ?? stats.Closed ?? 0;
    }

    const total = open + inProgress + closed;
    document.querySelector('[data-stat="total"]').textContent = total;
    document.querySelector('[data-stat="open"]').textContent = open;
    document.querySelector('[data-stat="inProgress"]').textContent = inProgress;
    document.querySelector('[data-stat="closed"]').textContent = closed;
  } catch (err) {
    showToast(err.message, 'error');
    document.querySelectorAll('.stub__value').forEach((el) => (el.textContent = '–'));
  }
}

async function loadRecentTickets() {
  const tbody = document.getElementById('recentTicketsBody');
  try {
    const [tickets, customers] = await Promise.all([api.getTickets(), api.getCustomers().catch(() => [])]);
    const customerName = (t) => t.customer_name
      || customers.find((c) => c.id === t.customer_id)?.name
      || '—';

    const recent = [...tickets]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="state"><h3>No tickets yet</h3><p>Create your first ticket to see it here.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map((t) => `
      <tr>
        <td class="id-tag">#${t.id}</td>
        <td>${escapeHtml(t.subject)}</td>
        <td>${escapeHtml(customerName(t))}</td>
        <td>${renderPriorityBadge(t.priority)}</td>
        <td>${renderStatusBadge(t.status)}</td>
        <td>${formatDate(t.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="state"><h3>Couldn't load tickets</h3><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

loadStats();
loadRecentTickets();
