import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Loader2, ScatterChart as ScatterIcon } from 'lucide-react';
import {
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Label,
} from 'recharts';
import {
  fetchCorrelation,
  CORRELATION_SENSORS,
  type CorrelationSensorKey,
  type CorrelationPoint,
  type AnalyticsRange,
} from '@/app/services/api';
import { TOOLTIP_STYLE } from '../constants';
import type { RangeKey } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CorrelationViewProps {
  range:      RangeKey;
  dateRange?: { from?: Date; to?: Date } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function labelFor(key: string) {
  return CORRELATION_SENSORS.find(s => s.key === key)?.label ?? key;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CorrelationView({ range, dateRange }: CorrelationViewProps) {
  const [sensorX, setSensorX] = useState<CorrelationSensorKey>('temperature');
  const [sensorY, setSensorY] = useState<CorrelationSensorKey>('conductivity');
  const [points,  setPoints]  = useState<CorrelationPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isCustomReady = range === 'custom' && dateRange?.from && dateRange?.to;
  const isCustom      = range === 'custom';

  const load = useCallback(async () => {
    if (isCustom && !isCustomReady) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchCorrelation(
        sensorX,
        sensorY,
        isCustomReady ? undefined : (range as AnalyticsRange),
        isCustomReady ? dateRange!.from : undefined,
        isCustomReady ? dateRange!.to   : undefined,
      );
      setPoints(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load correlation data');
    } finally {
      setLoading(false);
    }
  }, [sensorX, sensorY, range, dateRange, isCustom, isCustomReady]);

  useEffect(() => { load(); }, [load]);

  const handleSwap = () => {
    setSensorX(sensorY);
    setSensorY(sensorX);
  };

  // ── Derived labels ─────────────────────────────────────────────────────────
  const xLabel = labelFor(sensorX);
  const yLabel = labelFor(sensorY);

  return (
    <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-3">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-card-foreground">Sensor Correlation</h2>

        {/* Pair selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sensorX}
            onChange={e => setSensorX(e.target.value as CorrelationSensorKey)}
            className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CORRELATION_SENSORS.map(s => (
              <option key={s.key} value={s.key} disabled={s.key === sensorY}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwap}
            title="Swap axes"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <select
            value={sensorY}
            onChange={e => setSensorY(e.target.value as CorrelationSensorKey)}
            className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CORRELATION_SENSORS.map(s => (
              <option key={s.key} value={s.key} disabled={s.key === sensorX}>
                {s.label}
              </option>
            ))}
          </select>

          {loading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
        </div>
      </div>

      {/* ── Chart area ─────────────────────────────────────────────────────── */}
      <div className="h-64">
        {/* Waiting for custom date range */}
        {isCustom && !isCustomReady && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ScatterIcon className="w-8 h-8 opacity-25" />
            <p className="text-xs">Select a date range to load the chart</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="h-full flex items-center justify-center text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Empty state (loaded but no overlapping readings) */}
        {!loading && !error && points.length === 0 && (!isCustom || isCustomReady) && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ScatterIcon className="w-8 h-8 opacity-25" />
            <p className="text-xs">No data with both sensors present in this range</p>
          </div>
        )}

        {/* Scatter plot */}
        {!error && points.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 28, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['auto', 'auto']}
                tick={{ fontSize: 9 }}
                className="stroke-muted-foreground"
                tickFormatter={v => Number(v).toFixed(1)}
              >
                <Label
                  value={xLabel}
                  offset={-12}
                  position="insideBottom"
                  style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
              </XAxis>
              <YAxis
                dataKey="y"
                type="number"
                domain={['auto', 'auto']}
                tick={{ fontSize: 9 }}
                width={40}
                className="stroke-muted-foreground"
                tickFormatter={v => Number(v).toFixed(1)}
              >
                <Label
                  value={yLabel}
                  angle={-90}
                  position="insideLeft"
                  offset={8}
                  style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
              </YAxis>
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                wrapperStyle={{ outline: 'none' }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border:          '1px solid var(--border)',
                  borderRadius:    '6px',
                  fontSize:        '10px',
                  color:           'var(--foreground)',
                  boxShadow:       '0 4px 12px var(--shadow, rgba(0,0,0,0.15))',
                }}
                labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '2px' }}
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number, name: string) => [
                  Number(value).toFixed(3),
                  name === 'x' ? xLabel : yLabel,
                ]}
              />
              <Scatter
                data={points}
                fill="#6B7E49"
                fillOpacity={0.7}
                r={3}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Point count footnote */}
      {points.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-right -mt-1">
          {points.length === 500 ? '500 points (capped)' : `${points.length} data points`}
        </p>
      )}
    </div>
  );
}
