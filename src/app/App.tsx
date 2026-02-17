import { useState, useEffect, useRef, useCallback } from 'react';
import { Tank1Panel } from '@/app/components/Tank1Panel';
import { Tank2Panel } from '@/app/components/Tank2Panel';
import { Tank3Panel } from '@/app/components/Tank3Panel';
import { PumpControlPanel } from '@/app/components/PumpControlPanel';
import { HistoricalPanel } from '@/app/components/HistoricalPanel';
import { StageIndicator } from '@/app/components/StageIndicator';
import { ThemeToggle } from '@/app/components/ThemeToggle';

// Stage durations in seconds (simulated batch cycle)
const STAGE_DURATIONS = [20, 30, 15]; // Pre-treatment, Treatment, Post-treatment

type SensorName = 'ph' | 'flowRate' | 'tds' | 'salinity' | 'conductivity' | 'temperature' | 'voltage' | 'current' | 'totalVoltage' | 'totalCurrent';

type SensorConnectionMap = Record<SensorName, boolean>;

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

  // Sensor connection state — tracks whether each sensor is online
  const [sensorConnected, setSensorConnected] = useState<SensorConnectionMap>({
    ph: true,
    flowRate: true,
    tds: true,
    salinity: true,
    conductivity: true,
    temperature: true,
    voltage: true,
    current: true,
    totalVoltage: true,
    totalCurrent: true,
  });

  // Simulate occasional sensor disconnections (for demo)
  useEffect(() => {
    const sensorNames: SensorName[] = ['ph', 'flowRate', 'tds', 'temperature', 'voltage', 'current', 'totalVoltage', 'totalCurrent'];

    const interval = setInterval(() => {
      setSensorConnected(prev => {
        const next = { ...prev };
        // Small chance (5%) a random sensor goes offline
        if (Math.random() < 0.05) {
          const sensor = sensorNames[Math.floor(Math.random() * sensorNames.length)];
          next[sensor] = false;
          // Derived sensors go offline if their source (tds) goes offline
          if (sensor === 'tds') {
            next.salinity = false;
            next.conductivity = false;
          }
        }
        // Higher chance (15%) an offline sensor comes back online
        for (const sensor of sensorNames) {
          if (!prev[sensor] && Math.random() < 0.15) {
            next[sensor] = true;
            if (sensor === 'tds') {
              next.salinity = true;
              next.conductivity = true;
            }
          }
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Stage progression state
  const [currentStage, setCurrentStage] = useState(1); // 0=off, 1-3=active
  const [stageElapsed, setStageElapsed] = useState([0, 0, 0]); // seconds per stage
  const stageStartRef = useRef(Date.now());

  // Reset stages when pump turns off, start when pump turns on
  useEffect(() => {
    if (pumpOn) {
      setCurrentStage(1);
      setStageElapsed([0, 0, 0]);
      stageStartRef.current = Date.now();
    } else {
      setCurrentStage(0);
    }
  }, [pumpOn]);

  // Tick the stage timer every second
  useEffect(() => {
    if (!pumpOn || currentStage === 0) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - stageStartRef.current) / 1000);
      const stageIdx = currentStage - 1;
      const stageDuration = STAGE_DURATIONS[stageIdx];

      if (elapsed >= stageDuration) {
        // Stage complete — lock in its duration and advance
        setStageElapsed(prev => {
          const next = [...prev];
          next[stageIdx] = stageDuration;
          return next;
        });

        if (currentStage < 3) {
          setCurrentStage(currentStage + 1);
          stageStartRef.current = Date.now();
        } else {
          // Cycle complete — restart at stage 1
          setCurrentStage(1);
          setStageElapsed([0, 0, 0]);
          stageStartRef.current = Date.now();
        }
      } else {
        setStageElapsed(prev => {
          const next = [...prev];
          next[stageIdx] = elapsed;
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pumpOn, currentStage]);

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
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col lg:overflow-hidden overflow-y-auto">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="h-12 flex items-center justify-center px-8 gap-4">
          <h1 className="text-xl font-bold text-foreground">
            MFC Water Treatment Monitoring System
          </h1>
          <ThemeToggle />
        </div>

        {/* Stage Indicator */}
        <StageIndicator
          currentStage={currentStage}
          stageElapsed={stageElapsed}
          stageDurations={STAGE_DURATIONS}
        />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-2 md:p-3 min-h-0 lg:overflow-hidden overflow-y-auto">
        <div className="lg:grid lg:grid-cols-4 lg:grid-rows-[45fr_55fr] lg:gap-2 lg:h-full flex flex-col gap-2">
          {/* Tank1: 2 cols wide on desktop — has 6 sensors, needs the width */}
          <div className="min-h-[240px] lg:min-h-0 lg:col-span-2 overflow-hidden">
            <Tank1Panel
              ph={sensorData.ph}
              flowRate={sensorData.flowRate}
              tds={sensorData.tds}
              salinity={sensorData.salinity}
              conductivity={sensorData.conductivity}
              temperature={sensorData.temperature}
              connected={sensorConnected}
            />
          </div>

          <div className="min-h-[220px] lg:min-h-0 overflow-hidden">
            <Tank2Panel
              voltage={sensorData.voltage}
              current={sensorData.current}
              connected={sensorConnected}
            />
          </div>

          <div className="min-h-[220px] lg:min-h-0 overflow-hidden">
            <Tank3Panel
              totalVoltage={sensorData.totalVoltage}
              totalCurrent={sensorData.totalCurrent}
              connected={sensorConnected}
            />
          </div>

          {/* Historical: takes first 3 cols in row 2 */}
          <div className="min-h-[260px] lg:min-h-0 lg:col-span-3 overflow-hidden">
            <HistoricalPanel historicalData={historicalData} />
          </div>

          {/* Pump Control: right sidebar in row 2 */}
          <div className="min-h-[320px] lg:min-h-0 overflow-hidden">
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
      </div>

      {/* Footer */}
      <footer className="h-8 flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground border-t border-border">
        <p>MFC Water Treatment System | Live Data Updated Every Second</p>
      </footer>
    </div>
  );
}
