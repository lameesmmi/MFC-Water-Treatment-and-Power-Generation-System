import { useState, useEffect, type ReactElement } from 'react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Zap, Activity, CheckCircle2, AlertTriangle, Loader2, BarChart2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchAnalytics } from '@/app/services/api';
import type { AnalyticsData, AnalyticsRange } from '@/app/services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: '24h', label: '24 Hours' },
  { key: '7d',  label: '7 Days'  },
  { key: '30d', label: '30 Days' },
];

const SENSOR_LABELS: Record<string, string> = {
  ph:          'pH',
  tds:         'TDS',
  temperature: 'Temp',
  flow_rate:   'Flow Rate',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  warning:  '#f97316',
  info:     '#3b82f6',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    fontSize: '10px',
    color: 'var(--foreground)',
  },
  labelStyle: { color: 'var(--muted-foreground)' },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatMs(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 60_000)     return `${Math.round(ms / 1_000)}s`;
  if (ms < 3_600_000)  return `${Math.round(ms / 60_000)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, unit, icon: Icon, color, bg, border }: {
  label: string;
  value: string;
  unit:  string;
  icon:  LucideIcon;
  color: string;
  bg:    string;
  border: string;
}) {
  return (
    <div className={`${bg} rounded-lg border ${border} p-3 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function ChartCard({ title, height = 'h-64', children }: {
  title:    string;
  height?:  string;
  children: ReactElement;
}) {
  return (
    <div className={`bg-card rounded-lg border border-border p-3 flex flex-col ${height}`}>
      <h2 className="text-sm font-semibold mb-2 flex-shrink-0">{title}</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range,   setRange]   = useState<AnalyticsRange>('24h');
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAnalytics(range)
      .then(d  => setData(d))
      .catch(e  => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 h-12 flex items-center px-6 border-b border-border gap-3">
        <BarChart2 className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">Analytics &amp; Reports</h1>

        {/* Range selector */}
        <div className="ml-auto flex items-center gap-1">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                range === r.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading analytics…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            Failed to load analytics: {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
              <KpiCard
                label="Total Readings"
                value={String(data.summary.totalReadings)}
                unit="records"
                icon={Activity}
                color="text-blue-500 dark:text-blue-400"
                bg="bg-blue-500/10"
                border="border-blue-500/40"
              />
              <KpiCard
                label="EOR Pass Rate"
                value={data.summary.eorPassRate !== null ? data.summary.eorPassRate.toFixed(1) : '—'}
                unit={data.summary.eorPassRate !== null ? '%' : ''}
                icon={CheckCircle2}
                color="text-green-500 dark:text-green-400"
                bg="bg-green-500/10"
                border="border-green-500/40"
              />
              <KpiCard
                label="Total Energy"
                value={data.summary.totalEnergyWh.toFixed(3)}
                unit="Wh"
                icon={Zap}
                color="text-yellow-500 dark:text-yellow-400"
                bg="bg-yellow-500/10"
                border="border-yellow-500/40"
              />
              <KpiCard
                label="Avg Power"
                value={data.summary.avgPowerW.toFixed(3)}
                unit="W"
                icon={Activity}
                color="text-purple-500 dark:text-purple-400"
                bg="bg-purple-500/10"
                border="border-purple-500/40"
              />
            </div>

            {/* Main charts — 2-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Power over time */}
              <ChartCard title="Power Over Time (W)">
                <AreaChart data={data.powerOverTime}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 8 }} width={42} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="avgPower"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#powerGrad)"
                    dot={false}
                    name="Avg Power (W)"
                  />
                </AreaChart>
              </ChartCard>

              {/* EOR Pass / Fail stacked bar */}
              <ChartCard title="EOR Status Over Time">
                <BarChart data={data.eorOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 8 }} width={30} allowDecimals={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="pass" stackId="eor" fill="#22c55e" name="Pass" />
                  <Bar dataKey="fail" stackId="eor" fill="#ef4444" name="Fail" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartCard>

              {/* pH & Temperature trend */}
              <ChartCard title="pH &amp; Temperature Trend">
                <LineChart data={data.sensorTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 8 }} width={35} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="ph"          stroke="#3b82f6" strokeWidth={2} dot={false} name="pH" />
                  <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
                </LineChart>
              </ChartCard>

              {/* TDS trend */}
              <ChartCard title="TDS Trend (mg/L)">
                <AreaChart data={data.sensorTrends}>
                  <defs>
                    <linearGradient id="tdsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 8 }} width={45} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="tds"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#tdsGrad)"
                    dot={false}
                    name="TDS (mg/L)"
                  />
                </AreaChart>
              </ChartCard>
            </div>

            {/* Bottom row: Failures + Alert stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* EOR failures by sensor */}
              <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-2">
                <h2 className="text-sm font-semibold flex-shrink-0 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  EOR Failures by Sensor
                </h2>
                {data.failuresBySensor.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
                    No failures recorded in this period
                  </div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={data.failuresBySensor.map(f => ({
                          ...f,
                          sensor: SENSOR_LABELS[f.sensor] ?? f.sensor,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fontSize: 8 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="sensor" tick={{ fontSize: 9 }} width={65} />
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Bar dataKey="count" fill="#f97316" radius={[0, 2, 2, 0]} name="Failures" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Alert statistics */}
              <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-3">
                <h2 className="text-sm font-semibold">Alert Statistics</h2>

                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">By Severity</p>
                  {data.alertStats.bySeverity.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No alerts in this period</p>
                  ) : (
                    data.alertStats.bySeverity.map(s => (
                      <div key={s.severity} className="flex items-center justify-between text-xs">
                        <span
                          className="capitalize font-medium"
                          style={{ color: SEVERITY_COLORS[s.severity] ?? 'currentColor' }}
                        >
                          {s.severity}
                        </span>
                        <span className="font-bold tabular-nums">{s.count}</span>
                      </div>
                    ))
                  )}
                </div>

                <hr className="border-border" />

                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Resolution</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Alerts resolved</span>
                    <span className="font-bold tabular-nums">{data.alertStats.resolvedCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Avg resolution time</span>
                    <span className="font-bold tabular-nums">{formatMs(data.alertStats.avgResolutionMs)}</span>
                  </div>
                </div>

                {/* Alerts by sensor (mini list) */}
                {data.alertStats.bySensor.length > 0 && (
                  <>
                    <hr className="border-border" />
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Alerts by Sensor</p>
                      {data.alertStats.bySensor.map(s => (
                        <div key={s.sensor} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{SENSOR_LABELS[s.sensor] ?? s.sensor}</span>
                          <span className="font-bold tabular-nums">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
