import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface OutputPanelProps {
  phOutput: number;
  turbidityInput: number;
  turbidityOutput: number;
  treatmentEfficiency: number;
}

export function OutputPanel({ phOutput, turbidityInput, turbidityOutput, treatmentEfficiency }: OutputPanelProps) {
  const comparisonData = [
    { name: 'Input', value: turbidityInput, label: 'Dirty Water' },
    { name: 'Output', value: turbidityOutput, label: 'Clean Water' },
  ];

  const phPercentage = (phOutput / 14) * 100;
  const phData = [{ value: phPercentage, fill: '#3b82f6' }];

  const turbidityPercentage = (turbidityOutput / 10) * 100;
  const turbidityData = [{ value: turbidityPercentage, fill: '#3b82f6' }];

  return (
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800 h-full flex flex-col">
      <h2 className="text-sm font-semibold mb-2 text-gray-200">Output Stage</h2>
      
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left side - Output Gauges and Efficiency */}
        <div className="w-1/2 flex flex-col justify-between">
          {/* Output Gauges */}
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <div className="relative">
                <RadialBarChart
                  width={70}
                  height={70}
                  cx={35}
                  cy={35}
                  innerRadius={24}
                  outerRadius={33}
                  barSize={9}
                  data={phData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: '#1f2937' }}
                    dataKey="value"
                    cornerRadius={8}
                  />
                </RadialBarChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm font-bold text-blue-400">{phOutput.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">pH</div>
                </div>
              </div>
              <div className="text-xs text-gray-300 mt-1">pH Out</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <RadialBarChart
                  width={70}
                  height={70}
                  cx={35}
                  cy={35}
                  innerRadius={24}
                  outerRadius={33}
                  barSize={9}
                  data={turbidityData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: '#1f2937' }}
                    dataKey="value"
                    cornerRadius={8}
                  />
                </RadialBarChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm font-bold text-blue-400">{turbidityOutput.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">NTU</div>
                </div>
              </div>
              <div className="text-xs text-gray-300 mt-1">Turb. Out</div>
            </div>
          </div>
          
          {/* Efficiency Card */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-500 rounded p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-300">Efficiency</div>
                <div className="text-xl font-bold text-blue-400">{treatmentEfficiency.toFixed(1)}%</div>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* Right side - Comparison Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="text-xs text-gray-400 mb-1">Turbidity Reduction</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 9 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} width={30} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', fontSize: '10px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6b7280' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}