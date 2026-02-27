import { CheckCircle2, XCircle, TrendingUp, TrendingDown, WifiOff } from 'lucide-react';

interface SensorDisplayProps {
  label: string;
  value: number;
  unit: string;
  status: 'safe' | 'unsafe' | 'high' | 'low' | 'offline';
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
          bg: 'bg-green-500/10',
          border: 'border-green-500/40',
          text: 'text-green-600 dark:text-green-400',
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'SAFE'
        };
      case 'unsafe':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/40',
          text: 'text-red-600 dark:text-red-400',
          icon: <XCircle className="w-3 h-3" />,
          label: 'UNSAFE'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/40',
          text: 'text-orange-600 dark:text-orange-400',
          icon: <TrendingUp className="w-3 h-3" />,
          label: 'HIGH'
        };
      case 'low':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/40',
          text: 'text-yellow-600 dark:text-yellow-400',
          icon: <TrendingDown className="w-3 h-3" />,
          label: 'LOW'
        };
      case 'offline':
        return {
          bg: 'bg-muted',
          border: 'border-border',
          text: 'text-muted-foreground',
          icon: <WifiOff className="w-3 h-3" />,
          label: 'OFFLINE'
        };
    }
  };

  const config = getStatusConfig();
  const isOffline = status === 'offline';

  return (
    <div className={`${config.bg} rounded-lg p-2 border ${config.border} flex flex-col justify-between ${isOffline ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground truncate">
          {label}
          {isDerived && <span className="text-blue-500 dark:text-blue-400 italic ml-1">*</span>}
        </span>
        <span className={`${config.text} flex items-center gap-0.5`}>
          {config.icon}
          <span className="text-[10px] font-semibold">{config.label}</span>
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold leading-none ${isOffline ? 'text-muted-foreground' : 'text-foreground'}`}>
          {isOffline || value == null ? '--' : value.toFixed(decimals)}
        </span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
