import { SensorDisplay } from './SensorDisplay';
import { Zap } from 'lucide-react';

interface Tank3PanelProps {
  voltage: number;
  current: number;
  connected: Record<string, boolean>;
}

export function Tank3Panel({ voltage, current, connected }: Tank3PanelProps) {
  const voltageStatus = !connected.voltage ? 'offline' : voltage > 0 && voltage <= 50
    ? 'safe'
    : voltage > 50
    ? 'high'
    : 'low';

  const currentStatus = !connected.current ? 'offline' : current > 0 && current <= 5
    ? 'safe'
    : current > 5
    ? 'high'
    : 'low';

  const power = voltage * current;
  const powerOffline = !connected.voltage || !connected.current;

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-card-foreground">Post-treatment</h2>
        <p className="text-xs text-muted-foreground">MFC electrical output</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <SensorDisplay
            label="Voltage"
            value={voltage}
            unit="V"
            status={voltageStatus}
            decimals={2}
          />

          <SensorDisplay
            label="Current"
            value={current}
            unit="A"
            status={currentStatus}
            decimals={3}
          />
        </div>

        {/* Power Display */}
        <div className={`flex-1 min-h-0 border-2 rounded-lg p-2 flex flex-col items-center justify-center overflow-hidden ${
          powerOffline
            ? 'bg-muted border-border opacity-60'
            : 'bg-green-500/10 border-green-600 dark:border-green-700'
        }`}>
          <Zap className={`w-6 h-6 mb-1 ${powerOffline ? 'text-muted-foreground' : 'text-green-500 dark:text-green-400'}`} />
          <div className={`text-xs ${powerOffline ? 'text-muted-foreground' : 'text-green-600 dark:text-green-300'}`}>
            Power Output
          </div>
          <div className={`text-2xl font-bold ${powerOffline ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'}`}>
            {powerOffline ? '--' : power.toFixed(3)}
          </div>
          <div className="text-xs text-muted-foreground">Watts</div>
        </div>
      </div>
    </div>
  );
}
