import { Power, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PumpControlPanelProps {
  pumpOn: boolean;
  manualOverride: boolean;
  flowRate: number;
  flowHistory: Array<{ time: number; flow: number }>;
  onManualOverride: () => void;
  onPumpToggle: () => void;
  systemSafe: boolean;
}

export function PumpControlPanel({
  pumpOn,
  manualOverride,
  flowRate,
  flowHistory,
  onManualOverride,
  onPumpToggle,
  systemSafe
}: PumpControlPanelProps) {
  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-1">
        <h2 className="text-sm font-semibold text-card-foreground">Flow Pump Control Hub</h2>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
        {/* Pump Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
            pumpOn
              ? 'bg-green-500/10 border-2 border-green-500'
              : 'bg-red-500/10 border-2 border-red-500'
          }`}>
            <Power className={`w-5 h-5 ${pumpOn ? 'text-green-500 dark:text-green-400 animate-pulse' : 'text-red-500 dark:text-red-400'}`} />
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-bold ${pumpOn ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {pumpOn ? 'PUMP ON' : 'PUMP OFF'}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span><span className="text-foreground font-semibold">{flowRate.toFixed(1)}</span> L/min</span>
            </div>
          </div>
        </div>

        {/* Auto / Manual Toggle */}
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {manualOverride ? 'Manual Mode' : 'Auto Mode'}
          </span>
          <button
            onClick={onManualOverride}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              manualOverride ? 'bg-orange-500' : 'bg-green-500'
            }`}
            aria-label={manualOverride ? 'Switch to Auto Mode' : 'Switch to Manual Mode'}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              manualOverride ? 'left-[18px]' : 'left-0.5'
            }`} />
          </button>
        </div>

        {/* Manual Pump Toggle — only visible in manual mode */}
        {manualOverride && (
          <button
            onClick={onPumpToggle}
            className={`w-full px-2 py-1.5 rounded font-semibold text-xs transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
              pumpOn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {pumpOn ? 'Turn Pump OFF' : 'Turn Pump ON'}
          </button>
        )}

        {/* System Status Badge */}
        <div className={`px-2 py-1 rounded text-center flex-shrink-0 ${
          systemSafe
            ? 'bg-green-500/10 border border-green-600 dark:border-green-700'
            : 'bg-red-500/10 border border-red-600 dark:border-red-700'
        }`}>
          <div className={`text-xs font-semibold ${systemSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {systemSafe ? '✓ System Safe' : '⚠ System Unsafe'}
          </div>
          {!systemSafe && !manualOverride && (
            <div className="text-xs text-red-500 dark:text-red-300 mt-0.5">Auto shutdown active</div>
          )}
        </div>

        {/* Mini Flow Chart — fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="text-xs text-muted-foreground mb-0.5">Flow Rate</div>
          <div className="h-[calc(100%-1rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowHistory.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" hide />
                <YAxis
                  className="stroke-muted-foreground"
                  tick={{ fontSize: 8 }}
                  width={25}
                  domain={[80, 130]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', fontSize: '9px', color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--muted-foreground)' }}
                />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
