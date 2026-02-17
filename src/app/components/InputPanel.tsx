import { RadialGauge } from './RadialGauge';
import { AlertTriangle } from 'lucide-react';

interface InputPanelProps {
  phInput: number;
  turbidityInput: number;
  salinityInput: number;
  systemSafe: boolean;
  unsafeReason?: string;
}

export function InputPanel({ phInput, turbidityInput, salinityInput, systemSafe, unsafeReason }: InputPanelProps) {
  const phSafe = phInput >= 6.5 && phInput <= 6.8;
  const turbiditySafe = turbidityInput <= 5;
  const salinitySafe = salinityInput <= 10000;

  return (
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <h2 className="text-sm font-semibold mb-2 text-gray-200">Input Stage</h2>
      
      <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
        <RadialGauge
          label="pH"
          value={phInput}
          min={0}
          max={14}
          unit="pH"
          safeZone={{ min: 6.5, max: 6.8 }}
          isSafe={phSafe}
        />
        
        <RadialGauge
          label="Turbidity"
          value={turbidityInput}
          min={0}
          max={10}
          unit="NTU"
          safeZone={{ max: 5 }}
          isSafe={turbiditySafe}
        />
        
        <RadialGauge
          label="Salinity"
          value={salinityInput}
          min={0}
          max={12000}
          unit="ppm"
          safeZone={{ max: 10000 }}
          isSafe={salinitySafe}
        />
      </div>
      
      <div className={`mt-2 p-2 rounded ${systemSafe ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
        <div className="flex items-center gap-2">
          {!systemSafe && <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold ${systemSafe ? 'text-green-400' : 'text-red-400'}`}>
              {systemSafe ? 'SAFE' : 'UNSAFE'}
            </div>
            {!systemSafe && unsafeReason && (
              <div className="text-xs text-red-300 truncate">{unsafeReason}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}