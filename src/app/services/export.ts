import { apiFetch } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExportParams {
  /** Preset time range. Ignored when customFrom/customTo are provided. */
  range?:      '24h' | '7d' | '30d';
  /** Start of a custom date range. Must be paired with customTo. */
  customFrom?: Date;
  /** End of a custom date range. Must be paired with customFrom. */
  customTo?:   Date;
}

// ─── Download trigger ─────────────────────────────────────────────────────────

/**
 * Fetches a CSV of sensor readings for the given date range and triggers a
 * browser file download. The filename is taken from the server's
 * Content-Disposition header so it reflects the actual range exported.
 *
 * Throws an Error with a descriptive message on any failure (HTTP error,
 * network error, etc.). The calling component is responsible for surfacing
 * this to the user.
 *
 * @param params - Range selection. Provide either `range` (preset) or
 *                 `customFrom`+`customTo` (custom date range).
 */
export async function downloadReadingsCsv(params: ExportParams): Promise<void> {
  const url = buildExportUrl(params);
  const res = await apiFetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Export failed (HTTP ${res.status})`);
  }

  const blob        = await res.blob();
  const blobUrl     = URL.createObjectURL(blob);
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const nameMatch   = disposition.match(/filename="([^"]+)"/);
  const filename    = nameMatch?.[1] ?? 'mfc-readings.csv';

  // Create a temporary <a> element, click it to trigger the download, then
  // clean up both the element and the object URL immediately afterward.
  const anchor    = document.createElement('a');
  anchor.href     = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

// ─── Internal helper ──────────────────────────────────────────────────────────

function buildExportUrl(params: ExportParams): string {
  const base = `${import.meta.env.VITE_BACKEND_URL}/api/export/readings`;

  if (params.customFrom && params.customTo) {
    const from = encodeURIComponent(params.customFrom.toISOString());
    const to   = encodeURIComponent(params.customTo.toISOString());
    return `${base}?from=${from}&to=${to}`;
  }

  return `${base}?range=${params.range ?? '24h'}`;
}
