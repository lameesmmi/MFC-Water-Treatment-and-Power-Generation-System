import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { CheckCircle2, XCircle } from 'lucide-react';

interface RadialGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  safeZone: { min?: number; max?: number };
  isSafe: boolean;
}

export function RadialGauge({ label, value, min, max, unit, safeZone, isSafe }: RadialGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const data = [
    {
      name: label,
      value: percentage,
      fill: isSafe ? '#22c55e' : '#ef4444',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative">
        <RadialBarChart
          width={80}
          height={80}
          cx={40}
          cy={40}
          innerRadius={28}
          outerRadius={38}
          barSize={10}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#1f2937' }}
            dataKey="value"
            cornerRadius={8}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-base font-bold text-white">{value.toFixed(1)}</div>
          <div className="text-xs text-gray-500">{unit}</div>
        </div>
      </div>
      
      <div className="text-center mt-1">
        <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-300">{label}</span>
          {isSafe ? (
            <CheckCircle2 className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}