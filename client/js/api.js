/* ============================================================
   api.js — thin fetch wrapper around the backend REST API.
   Backend base URL. Change this if the server runs elsewhere.
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';

/**
 * Core request helper. Throws an Error with a readable message
 * on any non-2xx response so callers can catch it in one place.
 */
async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Is the backend running on http://localhost:5000?');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = body?.message || body?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

const api = {
  // Tickets
  getTickets: () => apiRequest('/tickets'),
  getTicketsFiltered: (qs) => apiRequest(`/tickets?${qs}`),
  getTicket: (id) => apiRequest(`/tickets/${id}`),
  getTicketStats: () => apiRequest('/tickets/stats'),
  searchTickets: (keyword) => apiRequest(`/tickets/search?keyword=${encodeURIComponent(keyword)}`),
  createTicket: (data) => apiRequest('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (id, data) => apiRequest(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTicket: (id) => apiRequest(`/tickets/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => apiRequest('/customers'),
  getCustomer: (id) => apiRequest(`/customers/${id}`),
  createCustomer: (data) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),
};
