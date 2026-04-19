import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { AnalyticsData } from '@/app/services/api';
import { TOOLTIP_STYLE }     from '../constants';
import { ChartCard }         from './ChartCard';

// ─── Theme-consistent chart palette ───────────────────────────────────────────
// Using CSS variables where possible; fixed values chosen to be
// clearly visible on both the light (#F7F7F7) and dark (#0F1117) backgrounds.

const C = {
  primary:  'var(--primary)',   // green — main data colour
  pass:     '#4ade80',          // green-400 — semantic pass
  fail:     '#f87171',          // red-400   — semantic fail
  ph:       '#60a5fa',          // blue-400  — pH line
  temp:     '#fb923c',          // orange-400 — temperature line
  voltage:  '#c084fc',          // purple-400 — voltage line
} as const;

const AXIS_STYLE = { fontSize: 8, fill: 'var(--muted-foreground)' } as const;
const LEGEND_STYLE = { fontSize: '10px', color: 'var(--muted-foreground)' } as const;

interface Props {
  data: AnalyticsData;
}

export function MainCharts({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── Power Over Time ─────────────────────────────────────────────────── */}
      <ChartCard title="Power Over Time (W)">
        <AreaChart data={data.powerOverTime}>
          <defs>
            <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  style={{ stopColor: 'var(--primary)', stopOpacity: 0.25 }} />
              <stop offset="95%" style={{ stopColor: 'var(--primary)', stopOpacity: 0    }} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} width={42} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="avgPower"
            stroke={C.primary}
            strokeWidth={2}
            fill="url(#powerGrad)"
            dot={false}
            name="Avg Power (W)"
          />
        </AreaChart>
      </ChartCard>

      {/* ── EOR Status Over Time ─────────────────────────────────────────────── */}
      <ChartCard title="EOR Status Over Time">
        <BarChart data={data.eorOverTime}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} width={30} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="pass" stackId="eor" fill={C.pass} name="Pass" />
          <Bar dataKey="fail" stackId="eor" fill={C.fail} name="Fail" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartCard>

      {/* ── pH & Temperature Trend ───────────────────────────────────────────── */}
      <ChartCard title="pH & Temperature Trend">
        <LineChart data={data.sensorTrends}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} width={35} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Line type="monotone" dataKey="ph"          stroke={C.ph}   strokeWidth={2} dot={false} name="pH" />
          <Line type="monotone" dataKey="temperature" stroke={C.temp} strokeWidth={2} dot={false} name="Temp (°C)" />
        </LineChart>
      </ChartCard>

      {/* ── TDS Trend ───────────────────────────────────────────────────────── */}
      <ChartCard title="TDS Trend (mg/L)">
        <AreaChart data={data.sensorTrends}>
          <defs>
            <linearGradient id="tdsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  style={{ stopColor: 'var(--primary)', stopOpacity: 0.25 }} />
              <stop offset="95%" style={{ stopColor: 'var(--primary)', stopOpacity: 0    }} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} width={45} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="tds"
            stroke={C.primary}
            strokeWidth={2}
            fill="url(#tdsGrad)"
            dot={false}
            name="TDS (mg/L)"
          />
        </AreaChart>
      </ChartCard>

      {/* ── Voltage Over Time ───────────────────────────────────────────────── */}
      <ChartCard title="Voltage Over Time (V)">
        <AreaChart data={data.sensorTrends}>
          <defs>
            <linearGradient id="voltageGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  style={{ stopColor: C.voltage, stopOpacity: 0.25 }} />
              <stop offset="95%" style={{ stopColor: C.voltage, stopOpacity: 0    }} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
          <YAxis tick={AXIS_STYLE} width={42} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="voltage"
            stroke={C.voltage}
            strokeWidth={2}
            fill="url(#voltageGrad)"
            dot={false}
            name="Avg Voltage (V)"
          />
        </AreaChart>
      </ChartCard>

    </div>
  );
}
