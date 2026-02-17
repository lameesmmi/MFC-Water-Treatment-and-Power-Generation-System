import { SensorDisplay } from './SensorDisplay';
import { Droplets } from 'lucide-react';

interface Tank3PanelProps {
  totalVoltage: number;
  totalCurrent: number;
  connected: Record<string, boolean>;
}

export function Tank3Panel({ totalVoltage, totalCurrent, connected }: Tank3PanelProps) {
  // Determine status for each sensor
  const totalVoltageStatus = !connected.totalVoltage ? 'offline' : totalVoltage >= 420 && totalVoltage <= 480
    ? 'safe'
    : totalVoltage > 480
    ? 'high'
    : 'low';
  const totalCurrentStatus = !connected.totalCurrent ? 'offline' : totalCurrent >= 8 && totalCurrent <= 14
    ? 'safe'
    : totalCurrent > 14
    ? 'high'
    : 'low';

  const totalPower = totalVoltage * totalCurrent;
  const powerOffline = !connected.totalVoltage || !connected.totalCurrent;

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-card-foreground">Tank 2: Post-treatment</h2>
        <p className="text-xs text-muted-foreground">Treated water output stage</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <SensorDisplay
            label="Total Voltage"
            value={totalVoltage}
            unit="V"
            status={totalVoltageStatus}
            decimals={1}
          />

          <SensorDisplay
            label="Total Current"
            value={totalCurrent}
            unit="A"
            status={totalCurrentStatus}
            decimals={2}
          />
        </div>

        {/* Total Power Display */}
        <div className={`flex-1 min-h-0 border-2 rounded-lg p-2 flex flex-col items-center justify-center overflow-hidden ${
          powerOffline
            ? 'bg-muted border-border opacity-60'
            : 'bg-green-500/10 border-green-600 dark:border-green-700'
        }`}>
          <Droplets className={`w-6 h-6 mb-1 ${powerOffline ? 'text-muted-foreground' : 'text-green-500 dark:text-green-400'}`} />
          <div className={`text-xs ${powerOffline ? 'text-muted-foreground' : 'text-green-600 dark:text-green-300'}`}>
            Total Power Output
          </div>
          <div className={`text-2xl font-bold ${powerOffline ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'}`}>
            {powerOffline ? '--' : totalPower.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">Watts</div>
        </div>
      </div>
    </div>
  );
}
