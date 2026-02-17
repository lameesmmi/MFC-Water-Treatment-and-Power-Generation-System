import { SensorDisplay } from './SensorDisplay';
import { Zap } from 'lucide-react';

interface Tank2PanelProps {
  voltage: number;
  current: number;
}

export function Tank2Panel({ voltage, current }: Tank2PanelProps) {
  // Determine status for each sensor
  const voltageStatus = voltage >= 210 && voltage <= 240
    ? 'safe'
    : voltage > 240
    ? 'high'
    : 'low';
  const currentStatus = current >= 4 && current <= 7
    ? 'safe'
    : current > 7
    ? 'high'
    : 'low';

  const power = voltage * current;

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-card-foreground">MFC Treatment</h2>
        <p className="text-xs text-muted-foreground">Electrical treatment process</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <SensorDisplay
            label="Voltage"
            value={voltage}
            unit="V"
            status={voltageStatus}
            decimals={1}
          />

          <SensorDisplay
            label="Current"
            value={current}
            unit="A"
            status={currentStatus}
            decimals={2}
          />
        </div>

        {/* Power Display - flat bg, no gradient */}
        <div className="flex-1 min-h-0 bg-blue-500/10 border-2 border-blue-600 dark:border-blue-700 rounded-lg p-2 flex flex-col items-center justify-center overflow-hidden">
          <Zap className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-1" />
          <div className="text-xs text-blue-600 dark:text-blue-300">Current Power Generation</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{power.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Watts</div>
        </div>
      </div>
    </div>
  );
}
