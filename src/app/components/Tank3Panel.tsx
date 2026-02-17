import { SensorDisplay } from './SensorDisplay';
import { Droplets } from 'lucide-react';

interface Tank3PanelProps {
  totalVoltage: number;
  totalCurrent: number;
}

export function Tank3Panel({ totalVoltage, totalCurrent }: Tank3PanelProps) {
  // Determine status for each sensor
  const totalVoltageStatus = totalVoltage >= 420 && totalVoltage <= 480
    ? 'safe'
    : totalVoltage > 480
    ? 'high'
    : 'low';
  const totalCurrentStatus = totalCurrent >= 8 && totalCurrent <= 14
    ? 'safe'
    : totalCurrent > 14
    ? 'high'
    : 'low';

  const totalPower = totalVoltage * totalCurrent;

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-card-foreground">Tank 3: Post-treatment</h2>
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

        {/* Total Power Display - flat bg, no gradient */}
        <div className="flex-1 min-h-0 bg-green-500/10 border-2 border-green-600 dark:border-green-700 rounded-lg p-2 flex flex-col items-center justify-center overflow-hidden">
          <Droplets className="w-6 h-6 text-green-500 dark:text-green-400 mb-1" />
          <div className="text-xs text-green-600 dark:text-green-300">Total Power Output</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPower.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Watts</div>
        </div>
      </div>
    </div>
  );
}
