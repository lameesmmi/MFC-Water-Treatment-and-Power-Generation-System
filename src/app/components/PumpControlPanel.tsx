import { Power, TrendingUp, PlayCircle, StopCircle } from 'lucide-react';
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
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-200">Pump Control</h2>
        <p className="text-xs text-gray-500">Flow management system</p>
      </div>
      
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        {/* Pump Status Visual */}
        <div className="flex items-center justify-center">
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
            pumpOn 
              ? 'bg-green-600/20 border-2 border-green-500' 
              : 'bg-red-600/20 border-2 border-red-500'
          }`}>
            <Power className={`w-10 h-10 ${pumpOn ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
            
            {pumpOn && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-green-400/50 to-transparent animate-pulse" />
            )}
          </div>
        </div>

        {/* Status and Flow Rate */}
        <div className="text-center">
          <div className={`text-sm font-bold mb-1 ${pumpOn ? 'text-green-400' : 'text-red-400'}`}>
            {pumpOn ? 'PUMP ON' : 'PUMP OFF'}
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>Flow: <span className="text-white font-semibold">{flowRate.toFixed(1)}</span> L/min</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-1.5">
          {/* Manual Override Toggle */}
          <button
            onClick={onManualOverride}
            className={`w-full px-3 py-2 rounded font-semibold text-xs transition-all ${
              manualOverride
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {manualOverride ? '🔓 Manual Override ON' : '🔒 Auto Mode'}
          </button>

          {/* Pump On/Off Toggle - only enabled in manual mode */}
          <button
            onClick={onPumpToggle}
            disabled={!manualOverride}
            className={`w-full px-3 py-2 rounded font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
              !manualOverride
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : pumpOn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {pumpOn ? (
              <>
                <StopCircle className="w-4 h-4" />
                Turn OFF
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Turn ON
              </>
            )}
          </button>
        </div>

        {/* System Status Badge */}
        <div className={`px-2 py-1.5 rounded text-center ${
          systemSafe 
            ? 'bg-green-900/30 border border-green-700' 
            : 'bg-red-900/30 border border-red-700'
        }`}>
          <div className={`text-xs font-semibold ${systemSafe ? 'text-green-400' : 'text-red-400'}`}>
            {systemSafe ? '✓ System Safe' : '⚠ System Unsafe'}
          </div>
          {!systemSafe && !manualOverride && (
            <div className="text-xs text-red-300 mt-0.5">Auto shutdown active</div>
          )}
        </div>

        {/* Mini Flow Chart */}
        <div className="flex-1 min-h-0">
          <div className="text-xs text-gray-400 mb-1">Flow Rate History</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={flowHistory.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                tick={{ fontSize: 7 }}
                hide
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 8 }}
                width={25}
                domain={[80, 130]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', fontSize: '9px' }}
                labelStyle={{ color: '#9ca3af' }}
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
  );
}
