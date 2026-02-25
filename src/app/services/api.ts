const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Endpoint map ─────────────────────────────────────────────────────────────
// All backend paths live here. Update once, works everywhere.
const ENDPOINTS = {
  health:   `${BASE_URL}/api/health`,
  readings: `${BASE_URL}/api/readings`,
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
