import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, TableProperties } from 'lucide-react';
import { fetchReadingsInRange, type SensorReading, type AnalyticsRange } from '@/app/services/api';
import type { DateRange } from 'react-day-picker';
import type { RangeKey } from '../constants';

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGE_MS: Record<AnalyticsRange, number> = {
  '24h': 86_400_000,
  '7d':  604_800_000,
  '30d': 2_592_000_000,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

// ─── Column definitions ───────────────────────────────────────────────────────

type ColKey = keyof SensorReading;

interface Column {
  key:     ColKey;
  label:   string;
  align:   'left' | 'right';
  format:  (v: SensorReading[ColKey]) => string;
}

const COLUMNS: Column[] = [
  { key: 'time',             label: 'Time',          align: 'left',  format: v => String(v ?? '—') },
  { key: 'ph',               label: 'pH',            align: 'right', format: v => (v as number)?.toFixed(2) ?? '—' },
  { key: 'tds',              label: 'TDS (ppm)',     align: 'right', format: v => (v as number)?.toFixed(0) ?? '—' },
  { key: 'temperature',      label: 'Temp (°C)',     align: 'right', format: v => (v as number)?.toFixed(1) ?? '—' },
  { key: 'flowRate',         label: 'Flow (L/min)',  align: 'right', format: v => (v as number)?.toFixed(2) ?? '—' },
  { key: 'salinity',         label: 'Salinity',      align: 'right', format: v => (v as number)?.toFixed(2) ?? '—' },
  { key: 'conductivity',     label: 'Conductivity',  align: 'right', format: v => (v as number)?.toFixed(1) ?? '—' },
  { key: 'voltage',          label: 'Voltage (V)',   align: 'right', format: v => (v as number)?.toFixed(2) ?? '—' },
  { key: 'current',          label: 'Current (A)',   align: 'right', format: v => (v as number)?.toFixed(3) ?? '—' },
  { key: 'power',            label: 'Power (W)',     align: 'right', format: v => (v as number)?.toFixed(3) ?? '—' },
  { key: 'valveStatus',      label: 'Valve',         align: 'left',  format: v => String(v ?? '—') },
  { key: 'validationStatus', label: 'EOR',           align: 'left',  format: v => String(v ?? '—') },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawDataTableProps {
  range:      RangeKey;
  dateRange?: DateRange;
}

type SortDir = 'asc' | 'desc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function compareRows(a: SensorReading, b: SensorReading, key: ColKey, dir: SortDir): number {
  const av = a[key], bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  const result = typeof av === 'number' && typeof bv === 'number'
    ? av - bv
    : String(av).localeCompare(String(bv));
  return dir === 'asc' ? result : -result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RawDataTable({ range, dateRange }: RawDataTableProps) {
  const [rows,     setRows]     = useState<SensorReading[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState('');
  const [sortKey,  setSortKey]  = useState<ColKey>('time');
  const [sortDir,  setSortDir]  = useState<SortDir>('desc');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(25);

  const isCustomReady = range === 'custom' && dateRange?.from && dateRange?.to;
  const isCustom      = range === 'custom';

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isCustom && !isCustomReady) return;

    let from: Date, to: Date;
    if (isCustomReady) {
      from = dateRange!.from!;
      to   = dateRange!.to!;
    } else {
      from = new Date(Date.now() - RANGE_MS[range as AnalyticsRange]);
      to   = new Date();
    }

    setLoading(true);
    setError(null);
    setPage(1);

    fetchReadingsInRange(from, to)
      .then(data => { setRows(data); })
      .catch(err  => setError(err instanceof Error ? err.message : 'Failed to load readings'))
      .finally(()  => setLoading(false));
  }, [range, dateRange?.from, dateRange?.to]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort + filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const base = q
      ? rows.filter(row =>
          COLUMNS.some(col => {
            const formatted = col.format(row[col.key]);
            return formatted.toLowerCase().includes(q);
          })
        )
      : rows;
    return [...base].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [rows, filter, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage    = Math.min(page, totalPages);
  const pageRows    = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: ColKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  // ── Sort icon ──────────────────────────────────────────────────────────────
  const SortIcon = ({ col }: { col: ColKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <h2 className="text-sm font-semibold text-card-foreground">Raw Readings</h2>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
          {!loading && rows.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{rows.length} records</span>
          )}
          <input
            type="text"
            placeholder="Filter…"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="text-xs bg-muted border border-border rounded px-2 py-1 w-36 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Waiting for custom range */}
      {isCustom && !isCustomReady && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <TableProperties className="w-8 h-8 opacity-25" />
          <p className="text-xs">Select a date range to load readings</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-xs text-destructive py-6 text-center">{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (!isCustom || isCustomReady) && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <TableProperties className="w-8 h-8 opacity-25" />
          <p className="text-xs">No readings in this range</p>
        </div>
      )}

      {/* Table */}
      {!error && rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-2 py-1.5 font-medium cursor-pointer select-none whitespace-nowrap border-b border-border hover:text-foreground transition-colors ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {col.label}
                        <SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr
                    key={row.timestamp}
                    className={`border-b border-border last:border-0 ${
                      i % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                    } hover:bg-muted/60 transition-colors`}
                  >
                    {COLUMNS.map(col => {
                      const formatted = col.format(row[col.key]);

                      // EOR badge
                      if (col.key === 'validationStatus') {
                        return (
                          <td key={col.key} className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              formatted === 'PASS'
                                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                                : formatted === 'FAIL'
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                  : 'text-muted-foreground'
                            }`}>
                              {formatted}
                            </span>
                          </td>
                        );
                      }

                      // Valve badge
                      if (col.key === 'valveStatus') {
                        return (
                          <td key={col.key} className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              formatted === 'OPEN'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {formatted}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className={`px-2 py-1.5 text-foreground ${col.align === 'right' ? 'text-right tabular-nums' : ''}`}
                        >
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Rows per page:</span>
              {PAGE_SIZE_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => { setPageSize(n); setPage(1); }}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                    pageSize === n
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {filtered.length === 0 ? '0' : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)}`} of {filtered.length}
              </span>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-2 py-0.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              <span className="text-foreground font-medium">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-2 py-0.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
