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
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-200">Tank 3: Post-treatment</h2>
        <p className="text-xs text-gray-500">Treated water output stage</p>
      </div>
      
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="grid grid-cols-2 gap-2">
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
        <div className="flex-1 bg-gradient-to-br from-green-900/30 to-blue-900/20 border-2 border-green-700 rounded-lg p-3 flex flex-col items-center justify-center">
          <Droplets className="w-8 h-8 text-green-400 mb-2" />
          <div className="text-xs text-green-300">Total Power Output</div>
          <div className="text-2xl font-bold text-green-400">{totalPower.toFixed(0)}</div>
          <div className="text-xs text-gray-400">Watts</div>
        </div>
      </div>
    </div>
  );
}
