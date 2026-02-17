import { CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface SensorDisplayProps {
  label: string;
  value: number;
  unit: string;
  status: 'safe' | 'unsafe' | 'high' | 'low';
  decimals?: number;
  isDerived?: boolean;
}

export function SensorDisplay({ 
  label, 
  value, 
  unit, 
  status, 
  decimals = 1,
  isDerived = false 
}: SensorDisplayProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-700',
          text: 'text-green-400',
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'SAFE'
        };
      case 'unsafe':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-700',
          text: 'text-red-400',
          icon: <XCircle className="w-3 h-3" />,
          label: 'UNSAFE'
        };
      case 'high':
        return {
          bg: 'bg-orange-900/30',
          border: 'border-orange-700',
          text: 'text-orange-400',
          icon: <TrendingUp className="w-3 h-3" />,
          label: 'HIGH'
        };
      case 'low':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-700',
          text: 'text-yellow-400',
          icon: <TrendingDown className="w-3 h-3" />,
          label: 'LOW'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex flex-col">
      {/* Sensor Value */}
      <div className="bg-gray-800/50 rounded-t p-2 border border-gray-700 border-b-0">
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <span>{label}</span>
          {isDerived && (
            <span className="text-xs text-blue-400 italic">(derived)</span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-white">{value.toFixed(decimals)}</span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className={`${config.bg} ${config.text} border ${config.border} rounded-b p-1.5 flex items-center justify-center gap-1`}>
        {config.icon}
        <span className="text-xs font-semibold">{config.label}</span>
      </div>
    </div>
  );
}
