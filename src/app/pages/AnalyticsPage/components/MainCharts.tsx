import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { AnalyticsData } from '@/app/services/api';
import { TOOLTIP_STYLE }     from '../constants';
import { ChartCard }         from './ChartCard';

interface Props {
  data: AnalyticsData;
}

export function MainCharts({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <Area type="monotone" dataKey="avgPower" stroke="#a855f7" strokeWidth={2} fill="url(#powerGrad)" dot={false} name="Avg Power (W)" />
        </AreaChart>
      </ChartCard>

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
          <Area type="monotone" dataKey="tds" stroke="#06b6d4" strokeWidth={2} fill="url(#tdsGrad)" dot={false} name="TDS (mg/L)" />
        </AreaChart>
      </ChartCard>
    </div>
  );
}
