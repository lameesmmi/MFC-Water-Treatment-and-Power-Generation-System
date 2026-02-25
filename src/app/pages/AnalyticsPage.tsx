import { useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Zap, Droplets, TrendingUp, Activity } from 'lucide-react';

interface HourlyData {
  hour: string;
  energyWh: number;
  efficiency: number;
  waterTreated: number;
  power: number;
}

function generateAnalyticsData(): HourlyData[] {
  const data: HourlyData[] = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const ts = new Date(now - i * 60 * 60 * 1000);
    const hour = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const voltage = 1.2 + (Math.random() - 0.5) * 0.4;   // MFC DC: ~1.0–1.4 V
    const current = 0.3 + (Math.random() - 0.5) * 0.1;   // MFC DC: ~0.25–0.35 A
    const power = voltage * current;                        // W (not kW — MFC scale)
    data.push({
      hour,
      power: +power.toFixed(2),
      energyWh: +(power * 1000).toFixed(0), // Wh per hour
      efficiency: +(75 + Math.random() * 20).toFixed(1),
      waterTreated: +(5700 + Math.random() * 900).toFixed(0), // L per hour
    });
  }
  return data;
}

export default function AnalyticsPage() {
  const data = useMemo(generateAnalyticsData, []);

  const totalEnergy = data.reduce((s, d) => s + d.energyWh, 0);
  const totalWater = data.reduce((s, d) => s + d.waterTreated, 0);
  const avgEfficiency = data.reduce((s, d) => s + d.efficiency, 0) / data.length;
  const peakPower = Math.max(...data.map(d => d.power));

  const kpis = [
    {
      label: 'Energy Generated (24h)',
      value: totalEnergy.toFixed(1),
      unit: 'Wh',
      icon: Zap,
      color: 'text-yellow-500 dark:text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/40',
    },
    {
      label: 'Water Treated (24h)',
      value: (totalWater / 1000).toFixed(1),
      unit: 'kL',
      icon: Droplets,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/40',
    },
    {
      label: 'Avg Efficiency',
      value: avgEfficiency.toFixed(1),
      unit: '%',
      icon: TrendingUp,
      color: 'text-green-500 dark:text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/40',
    },
    {
      label: 'Peak Power Output',
      value: peakPower.toFixed(3),
      unit: 'W',
      icon: Activity,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/40',
    },
  ];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      fontSize: '10px',
      color: 'var(--foreground)',
    },
    labelStyle: { color: 'var(--muted-foreground)' },
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-12 flex items-center px-6 border-b border-border gap-3">
        <h1 className="text-xl font-bold">Analytics &amp; Reports</h1>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
          {kpis.map(({ label, value, unit, icon: Icon, color, bg, border }) => (
            <div key={label} className={`${bg} rounded-lg border ${border} p-3 flex flex-col gap-1`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
          {/* Hourly Energy Bar Chart */}
          <div className="bg-card rounded-lg border border-border p-3 flex flex-col h-64">
            <h2 className="text-sm font-semibold mb-2 flex-shrink-0">Hourly Energy Output (Wh)</h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={3} />
                  <YAxis tick={{ fontSize: 8 }} width={35} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="energyWh" fill="#eab308" radius={[2, 2, 0, 0]} name="Energy (Wh)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency Area Chart */}
          <div className="bg-card rounded-lg border border-border p-3 flex flex-col h-64">
            <h2 className="text-sm font-semibold mb-2 flex-shrink-0">Treatment Efficiency (%)</h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={3} />
                  <YAxis tick={{ fontSize: 8 }} width={30} domain={[60, 100]} />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#effGradient)"
                    dot={false}
                    name="Efficiency (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Water Treated Bar Chart */}
          <div className="bg-card rounded-lg border border-border p-3 flex flex-col h-64">
            <h2 className="text-sm font-semibold mb-2 flex-shrink-0">Water Treated per Hour (L)</h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={3} />
                  <YAxis tick={{ fontSize: 8 }} width={40} domain={[5000, 7000]} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="waterTreated" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Water (L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Power Output Area Chart */}
          <div className="bg-card rounded-lg border border-border p-3 flex flex-col h-64">
            <h2 className="text-sm font-semibold mb-2 flex-shrink-0">Power Output (W)</h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={3} />
                  <YAxis tick={{ fontSize: 8 }} width={35} />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#powerGradient)"
                    dot={false}
                    name="Power (W)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
