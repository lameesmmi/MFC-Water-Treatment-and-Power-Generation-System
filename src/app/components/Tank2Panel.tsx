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
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-200"> MFC Treatment</h2>
        <p className="text-xs text-gray-500">Electrical treatment process</p>
      </div>
      
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="grid grid-cols-2 gap-2">
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
        
        {/* Power Display */}
        <div className="flex-1 bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-2 border-blue-700 rounded-lg p-3 flex flex-col items-center justify-center">
          <Zap className="w-8 h-8 text-blue-400 mb-2" />
          <div className="text-xs text-blue-300">Power Generation</div>
          <div className="text-2xl font-bold text-blue-400">{power.toFixed(0)}</div>
          <div className="text-xs text-gray-400">Watts</div>
        </div>
      </div>
    </div>
  );
}
