const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Endpoint map ─────────────────────────────────────────────────────────────
// All backend paths live here. Update once, works everywhere.
const ENDPOINTS = {
  health:        `${BASE_URL}/api/health`,
  readings:      `${BASE_URL}/api/readings`,
  alerts:        `${BASE_URL}/api/alerts`,
  alertAck:      (id: string) => `${BASE_URL}/api/alerts/${id}/acknowledge`,
  alertResolve:  (id: string) => `${BASE_URL}/api/alerts/${id}/resolve`,
  analytics:     (range: string) => `${BASE_URL}/api/analytics?range=${range}`,
  settings:      `${BASE_URL}/api/settings`,
  settingsReset: `${BASE_URL}/api/settings/reset`,
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

// ─── Requests ─────────────────────────────────────────────────────────────────

export async function fetchHistoricalReadings(limit = 100): Promise<SensorReading[]> {
  const res = await fetch(`${ENDPOINTS.readings}?limit=${limit}`);
  if (!res.ok) throw new Error(`GET /api/readings failed: ${res.status}`);
  return res.json();
}

// ─── Alert types ──────────────────────────────────────────────────────────────

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

// ─── Alert requests ───────────────────────────────────────────────────────────

export async function fetchAlerts(status?: AlertStatus, limit = 100): Promise<Alert[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.set('status', status);
  const res = await fetch(`${ENDPOINTS.alerts}?${params}`);
  if (!res.ok) throw new Error(`GET /api/alerts failed: ${res.status}`);
  return res.json();
}

export async function acknowledgeAlert(id: string): Promise<Alert> {
  const res = await fetch(ENDPOINTS.alertAck(id), { method: 'PATCH' });
  if (!res.ok) throw new Error(`PATCH /api/alerts/${id}/acknowledge failed: ${res.status}`);
  return res.json();
}

export async function resolveAlert(id: string): Promise<Alert> {
  const res = await fetch(ENDPOINTS.alertResolve(id), { method: 'PATCH' });
  if (!res.ok) throw new Error(`PATCH /api/alerts/${id}/resolve failed: ${res.status}`);
  return res.json();
}

// ─── Settings types ───────────────────────────────────────────────────────────

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

// ─── Settings requests ────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<SystemSettings> {
  const res = await fetch(ENDPOINTS.settings);
  if (!res.ok) throw new Error(`GET /api/settings failed: ${res.status}`);
  return res.json();
}

export async function saveSettings(body: Partial<Omit<SystemSettings, 'updatedAt'>>): Promise<SystemSettings> {
  const res = await fetch(ENDPOINTS.settings, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `PUT /api/settings failed: ${res.status}`);
  }
  return res.json();
}

export async function resetSettings(): Promise<SystemSettings> {
  const res = await fetch(ENDPOINTS.settingsReset, { method: 'POST' });
  if (!res.ok) throw new Error(`POST /api/settings/reset failed: ${res.status}`);
  return res.json();
}

// ─── Analytics types ──────────────────────────────────────────────────────────

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

// ─── Analytics request ────────────────────────────────────────────────────────

export async function fetchAnalytics(
  range: AnalyticsRange = '24h',
  from?: Date,
  to?: Date,
): Promise<AnalyticsData> {
  const base = `${BASE_URL}/api/analytics`;
  const url  = (from && to)
    ? `${base}?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`
    : ENDPOINTS.analytics(range);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET /api/analytics failed: ${res.status}`);
  return res.json();
}
