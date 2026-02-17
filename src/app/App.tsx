import { useState, useEffect } from 'react';
import { Tank1Panel } from '@/app/components/Tank1Panel';
import { Tank2Panel } from '@/app/components/Tank2Panel';
import { Tank3Panel } from '@/app/components/Tank3Panel';
import { PumpControlPanel } from '@/app/components/PumpControlPanel';
import { HistoricalPanel } from '@/app/components/HistoricalPanel';
import { StageIndicator } from '@/app/components/StageIndicator';

interface SensorData {
  // Tank 1 - Pre-treatment
  ph: number;
  flowRate: number;
  tds: number;
  salinity: number; // derived from TDS
  conductivity: number; // derived from TDS
  temperature: number;
  
  // Tank 2 - Treatment
  voltage: number;
  current: number;
  
  // Tank 3 - Post-treatment/Output
  totalVoltage: number;
  totalCurrent: number;
}

interface HistoricalData {
  timestamp: string;
  time: string;
  ph: number;
  flowRate: number;
  tds: number;
  salinity: number;
  conductivity: number;
  temperature: number;
  voltage: number;
  current: number;
  totalVoltage: number;
  totalCurrent: number;
}

function generateInitialHistoricalData(): HistoricalData[] {
  const data: HistoricalData[] = [];
  const now = Date.now();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000);
    const tds = 300 + Math.random() * 200;
    data.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ph: 6.5 + Math.random() * 0.5,
      flowRate: 100 + Math.random() * 20,
      tds: tds,
      salinity: tds * 0.5, // Salinity derived from TDS
      conductivity: tds * 2, // Conductivity derived from TDS
      temperature: 20 + Math.random() * 5,
      voltage: 220 + Math.random() * 20,
      current: 5 + Math.random() * 2,
      totalVoltage: 440 + Math.random() * 40,
      totalCurrent: 10 + Math.random() * 4,
    });
  }
  
  return data;
}

function generateSensorData(prevData?: SensorData): SensorData {
  if (!prevData) {
    const tds = 350 + Math.random() * 150;
    return {
      ph: 6.5 + Math.random() * 0.5,
      flowRate: 100 + Math.random() * 20,
      tds: tds,
      salinity: tds * 0.5,
      conductivity: tds * 2,
      temperature: 22 + Math.random() * 3,
      voltage: 220 + Math.random() * 20,
      current: 5 + Math.random() * 2,
      totalVoltage: 440 + Math.random() * 40,
      totalCurrent: 10 + Math.random() * 4,
    };
  }
  
  // Add small variations for realistic data
  const newTds = Math.max(0, Math.min(1000, prevData.tds + (Math.random() - 0.5) * 20));
  
  return {
    ph: Math.max(0, Math.min(14, prevData.ph + (Math.random() - 0.5) * 0.1)),
    flowRate: Math.max(80, Math.min(130, prevData.flowRate + (Math.random() - 0.5) * 3)),
    tds: newTds,
    salinity: newTds * 0.5,
    conductivity: newTds * 2,
    temperature: Math.max(15, Math.min(30, prevData.temperature + (Math.random() - 0.5) * 0.3)),
    voltage: Math.max(200, Math.min(250, prevData.voltage + (Math.random() - 0.5) * 3)),
    current: Math.max(3, Math.min(8, prevData.current + (Math.random() - 0.5) * 0.3)),
    totalVoltage: Math.max(400, Math.min(500, prevData.totalVoltage + (Math.random() - 0.5) * 5)),
    totalCurrent: Math.max(6, Math.min(15, prevData.totalCurrent + (Math.random() - 0.5) * 0.5)),
  };
}

export default function App() {
  const [sensorData, setSensorData] = useState<SensorData>(() => generateSensorData());
  const [pumpManualOverride, setPumpManualOverride] = useState(false);
  const [pumpOn, setPumpOn] = useState(true);
  const [flowHistory, setFlowHistory] = useState<Array<{ time: number; flow: number }>>(() => 
    Array.from({ length: 60 }, (_, i) => ({ time: i, flow: 100 + Math.random() * 20 }))
  );
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>(generateInitialHistoricalData);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Calculate system safety
  const phSafe = sensorData.ph >= 6.5 && sensorData.ph <= 7.5;
  const flowRateSafe = sensorData.flowRate >= 90 && sensorData.flowRate <= 120;
  const tdsSafe = sensorData.tds <= 500;
  const temperatureSafe = sensorData.temperature >= 18 && sensorData.temperature <= 28;
  const voltageSafe = sensorData.voltage >= 210 && sensorData.voltage <= 240;
  const currentSafe = sensorData.current >= 4 && sensorData.current <= 7;
  
  const systemSafe = phSafe && flowRateSafe && tdsSafe && temperatureSafe && voltageSafe && currentSafe;

  // Pump control logic
  useEffect(() => {
    if (!pumpManualOverride) {
      setPumpOn(systemSafe);
    }
  }, [systemSafe, pumpManualOverride]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => generateSensorData(prev));
      
      setFlowHistory(prev => {
        const newFlow = 100 + Math.random() * 20;
        const updated = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, flow: newFlow }];
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update historical data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const now = new Date();
        const newEntry: HistoricalData = {
          timestamp: now.toISOString(),
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          ph: sensorData.ph,
          flowRate: sensorData.flowRate,
          tds: sensorData.tds,
          salinity: sensorData.salinity,
          conductivity: sensorData.conductivity,
          temperature: sensorData.temperature,
          voltage: sensorData.voltage,
          current: sensorData.current,
          totalVoltage: sensorData.totalVoltage,
          totalCurrent: sensorData.totalCurrent,
        };
        
        return [...prev.slice(1), newEntry];
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [sensorData]);

  const handleManualOverride = () => {
    setPumpManualOverride(!pumpManualOverride);
  };

  const handlePumpToggle = () => {
    if (pumpManualOverride) {
      setPumpOn(!pumpOn);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Header - Fixed height */}
      <header className="flex-shrink-0 border-b border-gray-800">
        <div className="h-12 flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            MFC Water Treatment Monitoring System
          </h1>
        </div>
        
        {/* Stage Indicator */}
        <StageIndicator systemActive={pumpOn} />
      </header>

      {/* Main Content Area - Takes remaining space */}
      <div className="flex-1 p-2 flex flex-col gap-2 min-h-0">
        {/* Top Section - 4 panels (3 tanks + pump control) - 60% */}
        <div className="h-[60%] grid grid-cols-1 lg:grid-cols-4 gap-2">
          <div className="h-full overflow-hidden">
            <Tank1Panel
              ph={sensorData.ph}
              flowRate={sensorData.flowRate}
              tds={sensorData.tds}
              salinity={sensorData.salinity}
              conductivity={sensorData.conductivity}
              temperature={sensorData.temperature}
            />
          </div>

          <div className="h-full overflow-hidden">
            <Tank2Panel
              voltage={sensorData.voltage}
              current={sensorData.current}
            />
          </div>

          <div className="h-full overflow-hidden">
            <Tank3Panel
              totalVoltage={sensorData.totalVoltage}
              totalCurrent={sensorData.totalCurrent}
            />
          </div>

          <div className="h-full overflow-hidden">
            <PumpControlPanel
              pumpOn={pumpOn}
              manualOverride={pumpManualOverride}
              flowRate={sensorData.flowRate}
              flowHistory={flowHistory}
              onManualOverride={handleManualOverride}
              onPumpToggle={handlePumpToggle}
              systemSafe={systemSafe}
            />
          </div>
        </div>

        {/* Bottom Panel - Historical trends - 40% */}
        <div className="h-[40%] overflow-hidden">
          <HistoricalPanel historicalData={historicalData} />
        </div>
      </div>

      {/* Footer - Fixed height */}
      <footer className="h-8 flex-shrink-0 flex items-center justify-center text-xs text-gray-500 border-t border-gray-800">
        <p>MFC Water Treatment System | Live Data Updated Every Second</p>
      </footer>
    </div>
  );
}