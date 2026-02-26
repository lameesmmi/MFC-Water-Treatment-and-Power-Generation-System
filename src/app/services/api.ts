const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const TOKEN_KEY = 'mfc_token';

// ─── Internal fetch helper ─────────────────────────────────────────────────

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

// ─── Endpoint map ─────────────────────────────────────────────────────────────

const ENDPOINTS = {
  health:        `${BASE_URL}/api/health`,
  readings:      `${BASE_URL}/api/readings`,
  alerts:        `${BASE_URL}/api/alerts`,
  alertAck:      (id: string) => `${BASE_URL}/api/alerts/${id}/acknowledge`,
  alertResolve:  (id: string) => `${BASE_URL}/api/alerts/${id}/resolve`,
  analytics:     (range: string) => `${BASE_URL}/api/analytics?range=${range}`,
  settings:      `${BASE_URL}/api/settings`,
  settingsReset: `${BASE_URL}/api/settings/reset`,
  authSetup:     `${BASE_URL}/api/auth/setup`,
  authLogin:     `${BASE_URL}/api/auth/login`,
  authMe:        `${BASE_URL}/api/auth/me`,
  users:         `${BASE_URL}/api/users`,
  user:          (id: string) => `${BASE_URL}/api/users/${id}`,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SensorReading {
  timestamp:        string;
  time:             string;
  ph:               number;
  flowRate:         number;
  tds:              number;
  salinity:         number;
  conductivity:     number;
  temperature:      number;
  voltage:          number;
  current:          number;
  power:            number;
  valveStatus:      'OPEN' | 'CLOSED';
  validationStatus: 'PASS' | 'FAIL';
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus   = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id:          string;
  severity:    AlertSeverity;
  sensor:      string;
  message:     string;
  value?:      number;
  threshold?:  string;
  timestamp:   string;
  status:      AlertStatus;
  resolvedAt?: string;
}

export interface ThresholdConfig {
  min:      number;
  max:      number;
  severity: 'warning' | 'critical';
}

export interface SystemSettings {
  thresholds: {
    ph:          ThresholdConfig;
    tds:         ThresholdConfig;
    temperature: ThresholdConfig;
    flow_rate:   ThresholdConfig;
    voltage:     ThresholdConfig;
    current:     ThresholdConfig;
  };
  alertsEnabled: boolean;
  updatedAt:     string | null;
}

export type AnalyticsRange = '24h' | '7d' | '30d';

export interface AnalyticsData {
  range: AnalyticsRange | 'custom';
  summary: {
    totalReadings: number;
    eorPassRate:   number | null;
    totalEnergyWh: number;
    avgPowerW:     number;
  };
  powerOverTime:     { time: string; avgPower: number; energyWh: number }[];
  eorOverTime:       { time: string; pass: number; fail: number }[];
  sensorTrends:      { time: string; ph: number; tds: number; temperature: number }[];
  failuresBySensor:  { sensor: string; count: number }[];
  alertStats: {
    bySensor:        { sensor: string; count: number }[];
    bySeverity:      { severity: string; count: number }[];
    avgResolutionMs: number | null;
    resolvedCount:   number;
  };
}

export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      'admin' | 'operator' | 'viewer';
  color:     string;
  createdAt: string;
}

// ─── Sensor readings ──────────────────────────────────────────────────────────

export async function fetchHistoricalReadings(limit = 100): Promise<SensorReading[]> {
  const res = await apiFetch(`${ENDPOINTS.readings}?limit=${limit}`);
  if (!res.ok) throw new Error(`GET /api/readings failed: ${res.status}`);
  return res.json();
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function fetchAlerts(status?: AlertStatus, limit = 100): Promise<Alert[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.set('status', status);
  const res = await apiFetch(`${ENDPOINTS.alerts}?${params}`);
  if (!res.ok) throw new Error(`GET /api/alerts failed: ${res.status}`);
  return res.json();
}

export async function acknowledgeAlert(id: string): Promise<Alert> {
  const res = await apiFetch(ENDPOINTS.alertAck(id), { method: 'PATCH' });
  if (!res.ok) throw new Error(`PATCH /api/alerts/${id}/acknowledge failed: ${res.status}`);
  return res.json();
}

export async function resolveAlert(id: string): Promise<Alert> {
  const res = await apiFetch(ENDPOINTS.alertResolve(id), { method: 'PATCH' });
  if (!res.ok) throw new Error(`PATCH /api/alerts/${id}/resolve failed: ${res.status}`);
  return res.json();
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<SystemSettings> {
  const res = await apiFetch(ENDPOINTS.settings);
  if (!res.ok) throw new Error(`GET /api/settings failed: ${res.status}`);
  return res.json();
}

export async function saveSettings(body: Partial<Omit<SystemSettings, 'updatedAt'>>): Promise<SystemSettings> {
  const res = await apiFetch(ENDPOINTS.settings, {
    method: 'PUT',
    body:   JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `PUT /api/settings failed: ${res.status}`);
  }
  return res.json();
}

export async function resetSettings(): Promise<SystemSettings> {
  const res = await apiFetch(ENDPOINTS.settingsReset, { method: 'POST' });
  if (!res.ok) throw new Error(`POST /api/settings/reset failed: ${res.status}`);
  return res.json();
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function fetchAnalytics(
  range: AnalyticsRange = '24h',
  from?: Date,
  to?: Date,
): Promise<AnalyticsData> {
  const base = `${BASE_URL}/api/analytics`;
  const url  = (from && to)
    ? `${base}?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`
    : ENDPOINTS.analytics(range);
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`GET /api/analytics failed: ${res.status}`);
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function checkSetup(): Promise<{ needsSetup: boolean }> {
  const res = await fetch(ENDPOINTS.authSetup);
  if (!res.ok) throw new Error('Failed to check setup status');
  return res.json();
}

export async function setupAdmin(body: { name: string; email: string; password: string }): Promise<{ token: string; user: User }> {
  const res = await fetch(ENDPOINTS.authSetup, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Setup failed');
  return data;
}

export async function login(body: { email: string; password: string }): Promise<{ token: string; user: User }> {
  const res = await fetch(ENDPOINTS.authLogin, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Login failed');
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiFetch(ENDPOINTS.authMe);
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function updateMe(body: {
  name?:            string;
  currentPassword?: string;
  newPassword?:     string;
}): Promise<User> {
  const res = await apiFetch(ENDPOINTS.authMe, {
    method: 'PUT',
    body:   JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Update failed');
  return data;
}

// ─── User management ──────────────────────────────────────────────────────────

export async function listUsers(): Promise<User[]> {
  const res = await apiFetch(ENDPOINTS.users);
  if (!res.ok) throw new Error('Failed to list users');
  return res.json();
}

export async function createUser(body: {
  name: string; email: string; password: string; role: string;
}): Promise<User> {
  const res = await apiFetch(ENDPOINTS.users, {
    method: 'POST',
    body:   JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to create user');
  return data;
}

export async function updateUser(id: string, body: {
  name?: string; role?: string; password?: string;
}): Promise<User> {
  const res = await apiFetch(ENDPOINTS.user(id), {
    method: 'PUT',
    body:   JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to update user');
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await apiFetch(ENDPOINTS.user(id), { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to delete user');
  }
}
