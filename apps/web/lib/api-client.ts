/**
 * FraudShield AI — Typed API Client
 * All requests go through this single module.
 * Credentials are sent via httpOnly cookies automatically (credentials: 'include').
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      message = body.detail || body.message || message
    } catch {}
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────────────────
const auth = {
  login: (email: string, password: string) =>
    request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () =>
    request('/api/v1/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ id: string; email: string; full_name: string; role: string }>('/api/v1/auth/me'),

  register: (email: string, password: string, full_name: string) =>
    request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
}

// ── Predictions ──────────────────────────────────────────────────────────────
const predictions = {
  single: (data: Record<string, number>) =>
    request('/api/v1/predict', { method: 'POST', body: JSON.stringify(data) }),

  history: (page = 1, limit = 20, filters?: Record<string, string>) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters })
    return request(`/api/v1/predictions?${params}`)
  },

  getById: (id: string) => request(`/api/v1/predictions/${id}`),

  override: (id: string, verdict: 'fraud' | 'legitimate', reason: string) =>
    request(`/api/v1/predictions/${id}/override`, {
      method: 'PATCH',
      body: JSON.stringify({ verdict, reason }),
    }),
}

// ── Analytics ────────────────────────────────────────────────────────────────
const analytics = {
  kpis: (days = 30) => request(`/api/v1/dashboard/kpis?days=${days}`),
  roc: () => request('/api/v1/analytics/roc'),
  pr: () => request('/api/v1/analytics/pr-curve'),
  confusionMatrix: () => request('/api/v1/analytics/confusion-matrix'),
  fraudByHour: () => request('/api/v1/analytics/fraud-by-hour'),
  fraudByCountry: () => request('/api/v1/analytics/fraud-by-country'),
  fraudByMerchant: () => request('/api/v1/analytics/fraud-by-merchant'),
  featureImportance: () => request('/api/v1/analytics/feature-importance'),
}

// ── Models ───────────────────────────────────────────────────────────────────
const models = {
  list: () => request('/api/v1/models'),
  activate: (version: string) =>
    request(`/api/v1/models/${version}/activate`, { method: 'POST' }),
}

// ── Admin ────────────────────────────────────────────────────────────────────
const admin = {
  users: () => request('/api/v1/admin/users'),
  auditLogs: (page = 1, limit = 50) =>
    request(`/api/v1/admin/audit-logs?page=${page}&limit=${limit}`),
  updateUser: (id: string, data: Record<string, unknown>) =>
    request(`/api/v1/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// ── Reports ──────────────────────────────────────────────────────────────────
const reports = {
  generate: (format: 'pdf' | 'csv', dateFrom?: string, dateTo?: string) =>
    request('/api/v1/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ format, date_from: dateFrom, date_to: dateTo }),
    }),
  download: (reportId: string) =>
    fetch(`${BASE_URL}/api/v1/reports/${reportId}/download`, { credentials: 'include' }),
}

export const api = { auth, predictions, analytics, models, admin, reports }
export { ApiError }
