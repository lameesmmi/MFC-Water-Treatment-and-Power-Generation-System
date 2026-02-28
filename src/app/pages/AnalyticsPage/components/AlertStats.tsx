import { AlertTriangle }      from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsData } from '@/app/services/api';
import { SENSOR_LABELS, SEVERITY_COLORS, TOOLTIP_STYLE } from '../constants';
import { formatMs }           from '../utils';

interface Props {
  data: AnalyticsData;
}

export function AlertStats({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* EOR failures by sensor */}
      <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
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
  );
}
