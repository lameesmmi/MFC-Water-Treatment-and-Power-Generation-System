import { useState, useEffect, useRef } from 'react';
import { Tank1Panel } from '@/app/components/Tank1Panel';
import { Tank3Panel } from '@/app/components/Tank3Panel';
import { PumpControlPanel } from '@/app/components/PumpControlPanel';
import { HistoricalPanel } from '@/app/components/HistoricalPanel';
import { StageIndicator } from '@/app/components/StageIndicator';
import { getSocket } from '@/app/services/socket';
import { fetchHistoricalReadings } from '@/app/services/api';

const STAGE_DURATIONS = [20, 30, 15];
const SENSOR_TIMEOUT_MS = 15_000;

type SensorName = 'ph' | 'flowRate' | 'tds' | 'salinity' | 'conductivity' | 'temperature' | 'voltage' | 'current';
type SensorConnectionMap = Record<SensorName, boolean>;

interface SensorData {
  ph: number;
  flowRate: number;
  tds: number;
  salinity: number;
  conductivity: number;
  temperature: number;
  voltage: number;
  current: number;
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
}

const DEFAULT_SENSOR_DATA: SensorData = {
  ph: 0,
  flowRate: 0,
  tds: 0,
  salinity: 0,
  conductivity: 0,
  temperature: 0,
  voltage: 0,
  current: 0,
};

const ALL_OFFLINE: SensorConnectionMap = {
  ph: false,
  flowRate: false,
  tds: false,
  salinity: false,
  conductivity: false,
  temperature: false,
  voltage: false,
  current: false,
};

export default function DashboardPage() {
  const [backendConnected, setBackendConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>(DEFAULT_SENSOR_DATA);
  const [sensorConnected, setSensorConnected] = useState<SensorConnectionMap>(ALL_OFFLINE);
  const [valveStatus, setValveStatus] = useState<'OPEN' | 'CLOSED' | null>(null);
  const [pumpManualOverride, setPumpManualOverride] = useState(false);
  const [pumpOn, setPumpOn] = useState(false);
  const [flowHistory, setFlowHistory] = useState<Array<{ time: number; flow: number }>>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  const lastDataRef = useRef<number>(0);
  const flowTimeRef = useRef(0);

  // Stage progression state
  const [currentStage, setCurrentStage] = useState(1);
  const [stageElapsed, setStageElapsed] = useState([0, 0, 0]);
  const stageStartRef = useRef(Date.now());

  // Fetch historical data on mount
  useEffect(() => {
    fetchHistoricalReadings(100)
      .then(data => setHistoricalData(data))
      .catch(err => console.warn('[Dashboard] Failed to fetch historical data:', err));
  }, []);

  // Socket.io: live telemetry
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setBackendConnected(true);

    const onDisconnect = () => {
      setBackendConnected(false);
      setSensorConnected(ALL_OFFLINE);
    };

    const onTelemetry = (data: Record<string, number | string>) => {
      lastDataRef.current = Date.now();

      const newData: SensorData = {
        ph: data.ph as number,
        flowRate: data.flow_rate as number,
        tds: data.tds as number,
        salinity: data.salinity as number,
        conductivity: data.conductivity as number,
        temperature: data.temperature as number,
        voltage: data.voltage as number,
        current: data.current as number,
      };

      setSensorData(newData);
      setValveStatus(data.valve_status as 'OPEN' | 'CLOSED');

      setSensorConnected({
        ph: data.ph != null,
        flowRate: data.flow_rate != null,
        tds: data.tds != null,
        salinity: data.salinity != null,
        conductivity: data.conductivity != null,
        temperature: data.temperature != null,
        voltage: data.voltage != null,
        current: data.current != null,
      });

      setFlowHistory(prev => {
        const t = flowTimeRef.current++;
        return [...prev.slice(-59), { time: t, flow: data.flow_rate as number }];
      });

      const ts = new Date(data.timestamp as string);
      const entry: HistoricalData = {
        timestamp: data.timestamp as string,
        time: ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ph: data.ph as number,
        flowRate: data.flow_rate as number,
        tds: data.tds as number,
        salinity: data.salinity as number,
        conductivity: data.conductivity as number,
        temperature: data.temperature as number,
        voltage: data.voltage as number,
        current: data.current as number,
      };
      setHistoricalData(prev => [...prev.slice(-99), entry]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('live_telemetry', onTelemetry);

    // Mark sensors offline if no data received for SENSOR_TIMEOUT_MS
    const offlineTimer = setInterval(() => {
      if (lastDataRef.current > 0 && Date.now() - lastDataRef.current > SENSOR_TIMEOUT_MS) {
        setSensorConnected(ALL_OFFLINE);
      }
    }, 3000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('live_telemetry', onTelemetry);
      clearInterval(offlineTimer);
    };
  }, []);

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

  // Stage timer
  useEffect(() => {
    if (!pumpOn || currentStage === 0) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - stageStartRef.current) / 1000);
      const stageIdx = currentStage - 1;
      const stageDuration = STAGE_DURATIONS[stageIdx];

      if (elapsed >= stageDuration) {
        setStageElapsed(prev => {
          const next = [...prev];
          next[stageIdx] = stageDuration;
          return next;
        });
        if (currentStage < 3) {
          setCurrentStage(currentStage + 1);
          stageStartRef.current = Date.now();
        } else {
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

  // System safety based on water quality
  const phSafe = sensorData.ph >= 6.5 && sensorData.ph <= 8.5;
  const flowRateSafe = sensorData.flowRate >= 0.5 && sensorData.flowRate <= 10;
  const tdsSafe = sensorData.tds <= 5000;
  const temperatureSafe = sensorData.temperature >= 10 && sensorData.temperature <= 40;
  const systemSafe = phSafe && flowRateSafe && tdsSafe && temperatureSafe;

  // Auto pump control
  useEffect(() => {
    if (!pumpManualOverride) {
      setPumpOn(systemSafe);
    }
  }, [systemSafe, pumpManualOverride]);

  const handleManualOverride = () => setPumpManualOverride(prev => !prev);
  const handlePumpToggle = () => {
    if (pumpManualOverride) setPumpOn(prev => !prev);
  };

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col lg:overflow-hidden overflow-y-auto">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="h-12 flex items-center justify-center px-8 gap-4">
          <h1 className="text-xl font-bold text-foreground">
            MFC Water Treatment Monitoring System
          </h1>
          {/* Backend connection indicator */}
          <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${
            backendConnected
              ? 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-700 bg-green-500/10'
              : 'text-red-500 dark:text-red-400 border-red-500 dark:border-red-700 bg-red-500/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {backendConnected ? 'Live' : 'Disconnected'}
          </div>
        </div>

        <StageIndicator
          currentStage={currentStage}
          stageElapsed={stageElapsed}
          stageDurations={STAGE_DURATIONS}
        />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-2 md:p-3 min-h-0 lg:overflow-hidden overflow-y-auto">
        <div className="lg:grid lg:grid-cols-3 lg:grid-rows-[45fr_55fr] lg:gap-2 lg:h-full flex flex-col gap-2">
          {/* Tank 1: Pre-treatment — 2 cols on desktop */}
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

          {/* Tank 2: Post-treatment */}
          <div className="min-h-[220px] lg:min-h-0 overflow-hidden">
            <Tank3Panel
              voltage={sensorData.voltage}
              current={sensorData.current}
              connected={sensorConnected}
            />
          </div>

          {/* Historical chart — 2 cols */}
          <div className="min-h-[260px] lg:min-h-0 lg:col-span-2 overflow-hidden">
            <HistoricalPanel historicalData={historicalData} />
          </div>

          {/* Pump Control */}
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
        <p>MFC Water Treatment System | Live Data</p>
        {valveStatus && (
          <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-semibold ${
            valveStatus === 'OPEN'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            Valve: {valveStatus}
          </span>
        )}
      </footer>
    </div>
  );
}
