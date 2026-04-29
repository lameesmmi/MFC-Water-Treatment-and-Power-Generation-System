import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, TableProperties, Search, X } from 'lucide-react';
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
  {
    key: 'timestamp',
    label: 'Timestamp',
    align: 'left',
    format: v => {
      if (!v) return '—';
      return new Date(v as string).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    },
  },
  { key: 'ph',               label: 'pH',            align: 'right', format: v => (v as number)?.toFixed(2)  ?? '—' },
  { key: 'tds',              label: 'TDS (ppm)',      align: 'right', format: v => (v as number)?.toFixed(0)  ?? '—' },
  { key: 'temperature',      label: 'Temp (°C)',      align: 'right', format: v => (v as number)?.toFixed(1)  ?? '—' },
  { key: 'flowRate',         label: 'Flow (L/min)',   align: 'right', format: v => (v as number)?.toFixed(2)  ?? '—' },
  { key: 'salinity',         label: 'Salinity',       align: 'right', format: v => (v as number)?.toFixed(2)  ?? '—' },
  { key: 'conductivity',     label: 'Conductivity',   align: 'right', format: v => (v as number)?.toFixed(1)  ?? '—' },
  { key: 'voltage',          label: 'Voltage (V)',    align: 'right', format: v => (v as number)?.toFixed(2)  ?? '—' },
  { key: 'current',          label: 'Current (A)',    align: 'right', format: v => (v as number)?.toFixed(3)  ?? '—' },
  { key: 'power',            label: 'Power (W)',      align: 'right', format: v => (v as number)?.toFixed(3)  ?? '—' },
  { key: 'valveStatus',      label: 'Valve',          align: 'left',  format: v => String(v ?? '—') },
  { key: 'validationStatus', label: 'EOR',            align: 'left',  format: v => String(v ?? '—') },
];

// Columns available for targeted text search (skip status columns — those have quick filters)
const SEARCHABLE_COLS = COLUMNS.filter(
  c => c.key !== 'valveStatus' && c.key !== 'validationStatus'
);

// Numeric columns that support range syntax (>, <, >=, <=, n–m)
const NUMERIC_COL_KEYS = new Set<ColKey>([
  'ph', 'tds', 'temperature', 'flowRate',
  'salinity', 'conductivity', 'voltage', 'current', 'power',
]);

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawDataTableProps {
  range:      RangeKey;
  dateRange?: DateRange;
}

type SortDir     = 'asc' | 'desc';
type EorFilter   = 'all' | 'PASS' | 'FAIL';
type ValveFilter = 'all' | 'OPEN' | 'CLOSED';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Range filter parser ──────────────────────────────────────────────────────
// Parses expressions like >7, <=100, 6.5-8 and returns a numeric test function.
// Returns null when the query isn't a range expression (fall back to text match).

type RangeExpr =
  | { op: 'gt' | 'gte' | 'lt' | 'lte'; val: number }
  | { op: 'between'; min: number; max: number };

function parseRange(q: string): RangeExpr | null {
  const s = q.trim();
  let m: RegExpMatchArray | null;

  m = s.match(/^>=\s*(-?\d+(?:\.\d+)?)$/);
  if (m) return { op: 'gte', val: parseFloat(m[1]) };

  m = s.match(/^<=\s*(-?\d+(?:\.\d+)?)$/);
  if (m) return { op: 'lte', val: parseFloat(m[1]) };

  m = s.match(/^>\s*(-?\d+(?:\.\d+)?)$/);
  if (m) return { op: 'gt', val: parseFloat(m[1]) };

  m = s.match(/^<\s*(-?\d+(?:\.\d+)?)$/);
  if (m) return { op: 'lt', val: parseFloat(m[1]) };

  // n-m  or  n–m  (en-dash too) — only when right side is non-negative
  m = s.match(/^(-?\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/);
  if (m) return { op: 'between', min: parseFloat(m[1]), max: parseFloat(m[2]) };

  return null;
}

function testRange(value: number, expr: RangeExpr): boolean {
  switch (expr.op) {
    case 'gt':      return value >  expr.val;
    case 'gte':     return value >= expr.val;
    case 'lt':      return value <  expr.val;
    case 'lte':     return value <= expr.val;
    case 'between': return value >= expr.min && value <= expr.max;
  }
}

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickFilterGroup<T extends string>({
  label, options, value, onChange,
}: {
  label:    string;
  options:  { value: T; label: string }[];
  value:    T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground font-medium">{label}:</span>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
            value === opt.value
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RawDataTable({ range, dateRange }: RawDataTableProps) {
  const [rows,        setRows]        = useState<SensorReading[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Filters
  const [search,      setSearch]      = useState('');
  const [searchCol,   setSearchCol]   = useState<ColKey | 'all'>('all');
  const [eorFilter,   setEorFilter]   = useState<EorFilter>('all');
  const [valveFilter, setValveFilter] = useState<ValveFilter>('all');

  // Sort + pagination
  const [sortKey,  setSortKey]  = useState<ColKey>('timestamp');
  const [sortDir,  setSortDir]  = useState<SortDir>('desc');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(25);

  const isCustomReady = range === 'custom' && dateRange?.from && dateRange?.to;
  const isCustom      = range === 'custom';

  const hasActiveFilters = search.trim() !== '' || eorFilter !== 'all' || valveFilter !== 'all';

  const clearAllFilters = () => {
    setSearch('');
    setSearchCol('all');
    setEorFilter('all');
    setValveFilter('all');
    setPage(1);
  };

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
      .then(data => setRows(data))
      .catch(err  => setError(err instanceof Error ? err.message : 'Failed to load readings'))
      .finally(()  => setLoading(false));
  }, [range, dateRange?.from, dateRange?.to]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort + filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim();

    let base = rows;

    if (q) {
      // When a specific numeric column is selected, try range syntax first
      const isNumericCol = searchCol !== 'all' && NUMERIC_COL_KEYS.has(searchCol);
      const rangeExpr    = isNumericCol ? parseRange(q) : null;

      if (rangeExpr) {
        // Numeric range match against the selected column
        base = base.filter(row => {
          const val = row[searchCol] as number | null | undefined;
          return val != null && testRange(val, rangeExpr);
        });
      } else {
        // Plain text match (case-insensitive) — scoped to column or global
        const ql = q.toLowerCase();
        base = base.filter(row => {
          if (searchCol === 'all') {
            return COLUMNS.some(col => col.format(row[col.key]).toLowerCase().includes(ql));
          }
          const col = COLUMNS.find(c => c.key === searchCol);
          return col ? col.format(row[col.key]).toLowerCase().includes(ql) : false;
        });
      }
    }

    // Quick filters
    if (eorFilter !== 'all')   base = base.filter(row => row.validationStatus === eorFilter);
    if (valveFilter !== 'all') base = base.filter(row => row.valveStatus      === valveFilter);

    return [...base].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [rows, search, searchCol, eorFilter, valveFilter, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: ColKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: ColKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-3">

      {/* ── Filter bar ── */}
      <div className="flex flex-col gap-2 flex-shrink-0">

        {/* Row 1: title + search */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-card-foreground">Raw Readings</h2>
            {loading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
            {!loading && rows.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {filtered.length !== rows.length
                  ? `${filtered.length} of ${rows.length} records`
                  : `${rows.length} records`}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5">
              {/* Column selector */}
              <select
                value={searchCol}
                onChange={e => { setSearchCol(e.target.value as ColKey | 'all'); setSearch(''); setPage(1); }}
                className="text-[11px] bg-muted border border-border rounded px-1.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All columns</option>
                {SEARCHABLE_COLS.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative flex items-center">
                <Search className="absolute left-2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    searchCol !== 'all' && NUMERIC_COL_KEYS.has(searchCol as ColKey)
                      ? 'e.g. >7, <100, 6.5-8'
                      : 'Search…'
                  }
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="text-xs bg-muted border border-border rounded pl-6 pr-6 py-1 w-44 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Range syntax hint — shown only for numeric columns */}
            {searchCol !== 'all' && NUMERIC_COL_KEYS.has(searchCol as ColKey) && (
              <span className="text-[10px] text-muted-foreground">
                Ranges: <code className="font-mono">&gt;n</code> <code className="font-mono">&lt;n</code> <code className="font-mono">&gt;=n</code> <code className="font-mono">&lt;=n</code> <code className="font-mono">n–m</code>
              </span>
            )}
          </div>
        </div>

        {/* Row 2: quick filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <QuickFilterGroup
            label="EOR"
            value={eorFilter}
            onChange={v => { setEorFilter(v); setPage(1); }}
            options={[
              { value: 'all',  label: 'All'  },
              { value: 'PASS', label: 'Pass' },
              { value: 'FAIL', label: 'Fail' },
            ]}
          />
          <QuickFilterGroup
            label="Valve"
            value={valveFilter}
            onChange={v => { setValveFilter(v); setPage(1); }}
            options={[
              { value: 'all',    label: 'All'    },
              { value: 'OPEN',   label: 'Open'   },
              { value: 'CLOSED', label: 'Closed' },
            ]}
          />
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
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

      {/* No results after filtering */}
      {!loading && !error && rows.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
          <Search className="w-7 h-7 opacity-25" />
          <p className="text-xs">No records match the current filters</p>
          <button onClick={clearAllFilters} className="text-[11px] text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      {!error && rows.length > 0 && filtered.length > 0 && (
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
                          className={`px-2 py-1.5 text-foreground ${
                            col.align === 'right' ? 'text-right tabular-nums' : ''
                          } ${col.key === 'timestamp' ? 'whitespace-nowrap' : ''}`}
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
                {filtered.length === 0
                  ? '0'
                  : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)}`
                } of {filtered.length}
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
