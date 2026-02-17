import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

interface HistoricalData {
  timestamp: string;
  time: string;
  ph: number;
  flowRate: number;
  tds: number;
  salinity: number;
  conductivity: number;
  temperature: number;
  voltage: number;
  current: number;
  totalVoltage: number;
  totalCurrent: number;
}

interface HistoricalPanelProps {
  historicalData: HistoricalData[];
}

type SensorKey = 'ph' | 'flowRate' | 'tds' | 'salinity' | 'conductivity' | 'temperature' | 'voltage' | 'current' | 'totalVoltage' | 'totalCurrent';

interface SensorConfig {
  key: SensorKey;
  label: string;
  color: string;
  yAxis: 'left' | 'right';
}

const sensors: SensorConfig[] = [
  { key: 'ph', label: 'pH', color: '#3b82f6', yAxis: 'left' },
  { key: 'flowRate', label: 'Flow', color: '#22c55e', yAxis: 'left' },
  { key: 'tds', label: 'TDS', color: '#a855f7', yAxis: 'right' },
  { key: 'salinity', label: 'Salinity', color: '#f97316', yAxis: 'right' },
  { key: 'conductivity', label: 'Conductivity', color: '#06b6d4', yAxis: 'right' },
  { key: 'temperature', label: 'Temperature (°C)', color: '#ef4444', yAxis: 'left' },
  { key: 'voltage', label: 'Voltage (V)', color: '#eab308', yAxis: 'left' },
  { key: 'current', label: 'Current (A)', color: '#ec4899', yAxis: 'left' },
];

export function HistoricalPanel({ historicalData }: HistoricalPanelProps) {
  const [visibleSensors, setVisibleSensors] = useState<Record<SensorKey, boolean>>({
    ph: true,
    flowRate: true,
    tds: true,
    salinity: false,
    conductivity: false,
    temperature: true,
    voltage: true,
    current: false,
    totalVoltage: false,
    totalCurrent: false,
  });

  const toggleSensor = (key: SensorKey) => {
    setVisibleSensors(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col overflow-hidden">
      {/* Header + Legend — fixed, doesn't grow */}
      <div className="flex items-start justify-between mb-1 flex-shrink-0 gap-2">
        <h2 className="text-sm font-semibold text-card-foreground whitespace-nowrap">Historical Trends (24h)</h2>

        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex flex-wrap gap-1 justify-end">
            {sensors.map(sensor => (
              <button
                key={sensor.key}
                onClick={() => toggleSensor(sensor.key)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                  visibleSensors[sensor.key]
                    ? 'bg-secondary'
                    : 'bg-muted'
                }`}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: visibleSensors[sensor.key] ? sensor.color : 'var(--muted-foreground)'
                  }}
                />
                <span style={{
                  color: visibleSensors[sensor.key] ? sensor.color : 'var(--muted-foreground)'
                }}>
                  {sensor.label}
                </span>
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted hover:bg-secondary transition-colors text-[10px] flex-shrink-0">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">24h</span>
          </button>
        </div>
      </div>

      {/* Chart — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="time"
              className="stroke-muted-foreground"
              tick={{ fontSize: 8 }}
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
