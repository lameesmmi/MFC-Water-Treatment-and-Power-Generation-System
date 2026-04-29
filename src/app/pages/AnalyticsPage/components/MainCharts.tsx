import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { AnalyticsData } from '@/app/services/api';
import { TOOLTIP_STYLE }     from '../constants';
import { ChartCard }         from './ChartCard';

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  primary:  'var(--primary)',
  pass:     '#4ade80',
  fail:     '#f87171',
  ph:       '#60a5fa',
  temp:     '#fb923c',
  voltage:  '#c084fc',
  energy:   '#34d399',
} as const;

const AXIS_STYLE   = { fontSize: 8, fill: 'var(--muted-foreground)' } as const;
const LEGEND_STYLE = { fontSize: '10px', color: 'var(--muted-foreground)' } as const;

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-border" />
      {subtitle && (
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{subtitle}</span>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: AnalyticsData;
}

export function MainCharts({ data }: Props) {
  return (
    <div className="flex flex-col gap-6">

      {/* ════════════════════════════════════════════════════════════════════════
          ENERGY
          ════════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Energy" subtitle="Voltage, power output and cumulative energy" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Voltage Over Time */}
          <ChartCard title="Voltage Over Time (V)">
            <AreaChart data={data.sensorTrends}>
              <defs>
                <linearGradient id="voltageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  style={{ stopColor: C.voltage, stopOpacity: 0.28 }} />
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
                name="Voltage (V)"
              />
            </AreaChart>
          </ChartCard>

          {/* Power & Cumulative Energy — dual axis */}
          <ChartCard title="Power & Energy Over Time">
            <ComposedChart data={data.powerOverTime}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  style={{ stopColor: C.primary, stopOpacity: 0.28 }} />
                  <stop offset="95%" style={{ stopColor: C.primary, stopOpacity: 0    }} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis yAxisId="left"  tick={AXIS_STYLE} width={42} />
              <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} width={42} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={LEGEND_STYLE} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgPower"
                stroke={C.primary}
                strokeWidth={2}
                fill="url(#powerGrad)"
                dot={false}
                name="Avg Power (W)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="energyWh"
                stroke={C.energy}
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                name="Energy (Wh)"
              />
            </ComposedChart>
          </ChartCard>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          WATER TREATMENT
          ════════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Water Treatment" subtitle="Sensor readings across the treatment cycle" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* pH & Temperature */}
          <ChartCard title="pH & Temperature Trend">
            <LineChart data={data.sensorTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis tick={AXIS_STYLE} width={35} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={LEGEND_STYLE} />
              <Line type="monotone" dataKey="ph"          stroke={C.ph}   strokeWidth={2} dot={false} name="pH"         />
              <Line type="monotone" dataKey="temperature" stroke={C.temp} strokeWidth={2} dot={false} name="Temp (°C)"  />
            </LineChart>
          </ChartCard>

          {/* TDS */}
          <ChartCard title="TDS Trend (mg/L)">
            <AreaChart data={data.sensorTrends}>
              <defs>
                <linearGradient id="tdsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  style={{ stopColor: C.primary, stopOpacity: 0.28 }} />
                  <stop offset="95%" style={{ stopColor: C.primary, stopOpacity: 0    }} />
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

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          QUALITY & COMPLIANCE
          ════════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Quality & Compliance" subtitle="End-of-run validation results over time" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* EOR Status */}
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

          {/* Failures by Sensor */}
          {data.failuresBySensor.length > 0 && (
            <ChartCard title="EOR Failures by Sensor">
              <BarChart data={data.failuresBySensor} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={AXIS_STYLE} allowDecimals={false} />
                <YAxis type="category" dataKey="sensor" tick={AXIS_STYLE} width={80} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={C.fail} name="Failures" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ChartCard>
          )}

        </div>
      </section>

    </div>
  );
}
