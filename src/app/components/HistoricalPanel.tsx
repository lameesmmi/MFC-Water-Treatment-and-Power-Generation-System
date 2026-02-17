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
  { key: 'salinity', label: 'Sal', color: '#f97316', yAxis: 'right' },
  { key: 'conductivity', label: 'Cond', color: '#06b6d4', yAxis: 'right' },
  { key: 'temperature', label: 'Temp', color: '#ef4444', yAxis: 'left' },
  { key: 'voltage', label: 'V', color: '#eab308', yAxis: 'left' },
  { key: 'current', label: 'I', color: '#ec4899', yAxis: 'left' },
  { key: 'totalVoltage', label: 'TotV', color: '#84cc16', yAxis: 'left' },
  { key: 'totalCurrent', label: 'TotI', color: '#8b5cf6', yAxis: 'left' },
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
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-200">Historical Trends (24h)</h2>
        
        <div className="flex items-center gap-2">
          {/* Legend with toggles - scrollable */}
          <div className="flex gap-1 overflow-x-auto max-w-xl">
            {sensors.map(sensor => (
              <button
                key={sensor.key}
                onClick={() => toggleSensor(sensor.key)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs whitespace-nowrap transition-colors ${
                  visibleSensors[sensor.key] 
                    ? 'bg-gray-700' 
                    : 'bg-gray-800'
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: visibleSensors[sensor.key] ? sensor.color : '#4b5563' 
                  }} 
                />
                <span style={{ 
                  color: visibleSensors[sensor.key] ? sensor.color : '#6b7280' 
                }}>
                  {sensor.label}
                </span>
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors text-xs flex-shrink-0">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">24h</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              tick={{ fontSize: 8 }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6b7280"
              tick={{ fontSize: 8 }}
              width={30}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              tick={{ fontSize: 8 }}
              width={35}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', fontSize: '10px' }}
              labelStyle={{ color: '#9ca3af' }}
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
