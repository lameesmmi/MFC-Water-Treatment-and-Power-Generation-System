import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Droplets, StopCircle } from 'lucide-react';

interface ControlPanelProps {
  valveOpen: boolean;
  flowData: Array<{ time: number; flow: number }>;
  currentVariance: number;
  averageFlow: number;
}

export function ControlPanel({ valveOpen, flowData, currentVariance, averageFlow }: ControlPanelProps) {
  const varianceStable = Math.abs(currentVariance) <= 5;
  const upperThreshold = averageFlow * 1.05;
  const lowerThreshold = averageFlow * 0.95;

  return (
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <h2 className="text-sm font-semibold mb-2 text-gray-200">Control Hub</h2>
      
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Digital Twin Valve */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              valveOpen ? 'bg-green-600/20 border-2 border-green-500' : 'bg-gray-600/20 border-2 border-red-500'
            } transition-all duration-500`}>
              {valveOpen ? (
                <Droplets className="w-10 h-10 text-green-400 animate-pulse" />
              ) : (
                <StopCircle className="w-10 h-10 text-red-400" />
              )}
            </div>
            
            {valveOpen && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-green-400/50 to-transparent animate-pulse" />
            )}
          </div>
          
          <div className="text-center mt-2">
            <div className={`text-xs font-bold ${valveOpen ? 'text-green-400' : 'text-red-400'}`}>
              {valveOpen ? 'OPEN' : 'CLOSED'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {valveOpen ? 'Flowing' : 'Safety'}
            </div>
          </div>
        </div>
        
        {/* Flow Stability Sparkline */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">Flow Rate (L/min)</span>
            <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
              varianceStable ? 'bg-green-900/50 text-green-400' : 'bg-orange-900/50 text-orange-400'
            }`}>
              {varianceStable ? 'Stable' : 'Unstable'}
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  tick={{ fontSize: 8 }}
                  tickFormatter={(value) => `${value}s`}
                />
                <YAxis 
                  stroke="#6b7280"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 8 }}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', fontSize: '10px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <ReferenceLine y={upperThreshold} stroke="#f59e0b" strokeDasharray="5 5" />
                <ReferenceLine y={lowerThreshold} stroke="#f59e0b" strokeDasharray="5 5" />
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