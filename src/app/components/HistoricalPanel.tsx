import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchReadingsInRange } from '../services/api';
import type { SensorReading } from '../services/api';
import type { HistoricalData } from '../pages/DashboardPage/types';

type FilterMode = 'live' | '24h' | '7d' | '30d' | 'custom';
type SensorKey  = 'ph' | 'flowRate' | 'tds' | 'salinity' | 'conductivity' | 'temperature' | 'voltage' | 'current';

interface SensorConfig {
  key:   SensorKey;
  label: string;
  color: string;
  yAxis: 'left' | 'right';
}

const sensors: SensorConfig[] = [
  { key: 'ph',           label: 'pH',              color: '#3b82f6', yAxis: 'left'  },
  { key: 'flowRate',     label: 'Flow',             color: '#22c55e', yAxis: 'left'  },
  { key: 'tds',          label: 'TDS',              color: '#a855f7', yAxis: 'right' },
  { key: 'salinity',     label: 'Salinity',         color: '#f97316', yAxis: 'right' },
  { key: 'conductivity', label: 'Conductivity',     color: '#06b6d4', yAxis: 'right' },
  { key: 'temperature',  label: 'Temperature (°C)', color: '#ef4444', yAxis: 'left'  },
  { key: 'voltage',      label: 'Voltage (V)',      color: '#eab308', yAxis: 'left'  },
  { key: 'current',      label: 'Current (A)',      color: '#ec4899', yAxis: 'left'  },
];

const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
  { key: 'live',   label: 'Live'    },
  { key: '24h',    label: '24h'     },
  { key: '7d',     label: '7 days'  },
  { key: '30d',    label: '30 days' },
  { key: 'custom', label: 'Custom'  },
];

interface HistoricalPanelProps {
  liveData: HistoricalData[];
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTimestamp(timestamp: string, mode: FilterMode, rangeMs: number): string {
  const d = new Date(timestamp);
  if (mode === 'live' || mode === '24h' || (mode === 'custom' && rangeMs <= 2 * 86_400_000)) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (mode === '7d' || (mode === 'custom' && rangeMs <= 14 * 86_400_000)) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function HistoricalPanel({ liveData }: HistoricalPanelProps) {
  const [visibleSensors, setVisibleSensors] = useState<Record<SensorKey, boolean>>({
    ph: true, flowRate: true, tds: true, salinity: false,
    conductivity: false, temperature: true, voltage: true, current: false,
  });

  const [filter,     setFilter]     = useState<FilterMode>('live');
  const [customFrom, setCustomFrom] = useState(() => toDateInput(new Date(Date.now() - 7 * 86_400_000)));
  const [customTo,   setCustomTo]   = useState(() => toDateInput(new Date()));
  const [fetchedData, setFetchedData] = useState<HistoricalData[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (filter === 'live') return;

    const now = new Date();
    let from: Date;
    let to: Date = now;

    if (filter === '24h') {
      from = new Date(now.getTime() - 24 * 3_600_000);
    } else if (filter === '7d') {
      from = new Date(now.getTime() - 7 * 86_400_000);
    } else if (filter === '30d') {
      from = new Date(now.getTime() - 30 * 86_400_000);
    } else {
      from = new Date(customFrom);
      to   = new Date(customTo);
      to.setHours(23, 59, 59, 999);
    }

    const rangeMs = to.getTime() - from.getTime();

    setLoading(true);
    setFetchError(null);

    fetchReadingsInRange(from, to, 2000)
      .then((readings: SensorReading[]) => {
        // API returns newest-first; reverse so the chart renders left-to-right chronologically
        const mapped: HistoricalData[] = [...readings].reverse().map(r => ({
          timestamp:    r.timestamp,
          time:         formatTimestamp(r.timestamp, filter, rangeMs),
          ph:           r.ph,
          flowRate:     r.flowRate,
          tds:          r.tds,
          salinity:     r.salinity,
          conductivity: r.conductivity,
          temperature:  r.temperature,
          voltage:      r.voltage,
          current:      r.current,
        }));
        setFetchedData(mapped);
      })
      .catch(() => setFetchError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [filter, customFrom, customTo]);

  const toggleSensor = (key: SensorKey) =>
    setVisibleSensors(prev => ({ ...prev, [key]: !prev[key] }));

  const displayData = filter === 'live' ? liveData : fetchedData;

  // Attach a numeric Unix-ms field so recharts can use a time-proportional axis.
  // This ensures Apr 19 data and Apr 29 data are spaced by actual elapsed time,
  // not by equal category slots (which squishes recent data to the right edge).
  const chartData = displayData.map(d => ({
    ...d,
    ts: new Date(d.timestamp).getTime(),
  }));

  // Requested range drives tick label format regardless of how much data exists.
  const requestedRangeMs =
    filter === '24h'   ? 24 * 3_600_000 :
    filter === '7d'    ? 7  * 86_400_000 :
    filter === '30d'   ? 30 * 86_400_000 :
    filter === 'custom'
      ? (new Date(customTo).getTime() + 86_400_000) - new Date(customFrom).getTime()
      : 0;

  const tickFormatter = (tsValue: number) =>
    formatTimestamp(new Date(tsValue).toISOString(), filter, requestedRangeMs);

  const tooltipLabelFormatter = (tsValue: number) =>
    new Date(tsValue).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const lastEntry = displayData[displayData.length - 1];
  const lastDate  = lastEntry?.timestamp
    ? new Date(lastEntry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-1 flex-shrink-0 gap-2">

        <div className="flex flex-col flex-shrink-0">
          <h2 className="text-sm font-semibold text-card-foreground whitespace-nowrap">Historical Trends</h2>
          {lastDate && (
            <span className="text-[10px] text-muted-foreground">Last data: {lastDate}</span>
          )}
        </div>

        <div className="flex items-start gap-1.5 min-w-0 flex-wrap justify-end">

          {/* Sensor legend toggles */}
          <div className="flex flex-wrap gap-1 justify-end">
            {sensors.map(sensor => (
              <button
                key={sensor.key}
                onClick={() => toggleSensor(sensor.key)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                  visibleSensors[sensor.key] ? 'bg-secondary' : 'bg-muted'
                }`}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: visibleSensors[sensor.key] ? sensor.color : 'var(--muted-foreground)' }}
                />
                <span style={{ color: visibleSensors[sensor.key] ? sensor.color : 'var(--muted-foreground)' }}>
                  {sensor.label}
                </span>
              </button>
            ))}
          </div>

          {/* Filter tab strip */}
          <div className="flex items-center gap-0.5 bg-muted rounded p-0.5 flex-shrink-0">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                  filter === opt.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Custom date range row ── */}
      {filter === 'custom' && (
        <div className="flex items-center gap-2 mb-1 flex-shrink-0 flex-wrap">
          <span className="text-[10px] text-muted-foreground">From</span>
          <input
            type="date"
            value={customFrom}
            max={customTo}
            onChange={e => setCustomFrom(e.target.value)}
            className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">To</span>
          <input
            type="date"
            value={customTo}
            min={customFrom}
            max={toDateInput(new Date())}
            onChange={e => setCustomTo(e.target.value)}
            className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-foreground"
          />
          {loading && <span className="text-[10px] text-muted-foreground">Loading…</span>}
          {fetchError && <span className="text-[10px] text-destructive">{fetchError}</span>}
        </div>
      )}

      {/* ── Chart ── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {loading && filter !== 'custom' && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/60 z-10">
            <span className="text-[11px] text-muted-foreground">Loading…</span>
          </div>
        )}
        {fetchError && filter !== 'custom' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[11px] text-destructive">{fetchError}</span>
          </div>
        )}
        {!loading && !fetchError && displayData.length === 0 && filter !== 'live' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[11px] text-muted-foreground">No data for this period</span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={tickFormatter}
              className="stroke-muted-foreground"
              tick={{ fontSize: 8 }}
              minTickGap={55}
            />
            <YAxis
              yAxisId="left"
              className="stroke-muted-foreground"
              tick={{ fontSize: 8 }}
              width={30}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="stroke-muted-foreground"
              tick={{ fontSize: 8 }}
              width={35}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', fontSize: '10px', color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--muted-foreground)' }}
              labelFormatter={tooltipLabelFormatter}
            />
            {sensors.map(sensor => (
              visibleSensors[sensor.key] && (
                <Line
                  key={sensor.key}
                  yAxisId={sensor.yAxis}
                  type="monotone"
                  dataKey={sensor.key}
                  stroke={sensor.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name={sensor.label}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
