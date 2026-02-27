import { useState, useEffect, useRef } from 'react';
import { PreTreatmentPanel } from '@/app/components/PreTreatmentPanel';
import { PostTreatmentPanel } from '@/app/components/PostTreatmentPanel';
import { PumpControlPanel } from '@/app/components/PumpControlPanel';
import { HistoricalPanel } from '@/app/components/HistoricalPanel';
import { getSocket } from '@/app/services/socket';
import { fetchHistoricalReadings } from '@/app/services/api';

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
  ph: 0, flowRate: 0, tds: 0, salinity: 0,
  conductivity: 0, temperature: 0, voltage: 0, current: 0,
};

const ALL_OFFLINE: SensorConnectionMap = {
  ph: false, flowRate: false, tds: false, salinity: false,
  conductivity: false, temperature: false, voltage: false, current: false,
};

export default function DashboardPage() {
  // socketConnected = transport-level connection; isLive = data arriving within timeout
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const [sensorData, setSensorData] = useState<SensorData>(DEFAULT_SENSOR_DATA);
  const [sensorConnected, setSensorConnected] = useState<SensorConnectionMap>(ALL_OFFLINE);
  const [valveStatus, setValveStatus] = useState<'OPEN' | 'CLOSED' | null>(null);
  const [pumpManualOverride, setPumpManualOverride] = useState(false);
  const [pumpOn, setPumpOn] = useState(false);
  const [flowHistory, setFlowHistory] = useState<Array<{ time: number; flow: number }>>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  const lastDataRef = useRef<number>(0);
  const flowTimeRef = useRef(0);

  // Fetch historical data on mount
  useEffect(() => {
    fetchHistoricalReadings(100)
      .then(data => setHistoricalData(data))
      .catch(err => console.warn('[Dashboard] Failed to fetch historical data:', err));
  }, []);

  // Socket.io: live telemetry
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);

    const onDisconnect = () => {
      setSocketConnected(false);
      setIsLive(false);
      setSensorConnected(ALL_OFFLINE);
    };

    const onTelemetry = (data: Record<string, number | string>) => {
      lastDataRef.current = Date.now();
      setIsLive(true);

      // Merge with previous state — absent sensors keep their last known value
      // so sensorData never contains undefined, preventing runtime errors in child components.
      setSensorData(prev => ({
        ...prev,
        ...(data.ph           != null && { ph:           data.ph           as number }),
        ...(data.flow_rate    != null && { flowRate:     data.flow_rate    as number }),
        ...(data.tds          != null && { tds:          data.tds          as number }),
        ...(data.salinity     != null && { salinity:     data.salinity     as number }),
        ...(data.conductivity != null && { conductivity: data.conductivity as number }),
        ...(data.temperature  != null && { temperature:  data.temperature  as number }),
        ...(data.voltage      != null && { voltage:      data.voltage      as number }),
        ...(data.current      != null && { current:      data.current      as number }),
      }));

      // Only update valve status if the sensor reported one
      if (data.valve_status != null) {
        setValveStatus(data.valve_status as 'OPEN' | 'CLOSED');
      }

      // Each sensor is online only if its field was present in this packet
      setSensorConnected({
        ph:           data.ph           != null,
        flowRate:     data.flow_rate    != null,
        tds:          data.tds          != null,
        salinity:     data.salinity     != null,
        conductivity: data.conductivity != null,
        temperature:  data.temperature  != null,
        voltage:      data.voltage      != null,
        current:      data.current      != null,
      });

      // Only push a flow history point if flow rate was reported in this packet
      if (data.flow_rate != null) {
        setFlowHistory(prev => {
          const t = flowTimeRef.current++;
          return [...prev.slice(-59), { time: t, flow: data.flow_rate as number }];
        });
      }

      const ts = new Date(data.timestamp as string);
      const entry: HistoricalData = {
        timestamp:    data.timestamp    as string,
        time:         ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ph:           data.ph           as number,
        flowRate:     data.flow_rate    as number,
        tds:          data.tds          as number,
        salinity:     data.salinity     as number,
        conductivity: data.conductivity as number,
        temperature:  data.temperature  as number,
        voltage:      data.voltage      as number,
        current:      data.current      as number,
      };
      setHistoricalData(prev => [...prev.slice(-99), entry]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('live_telemetry', onTelemetry);

    // Drop isLive if no packet arrives within the timeout window
    const offlineTimer = setInterval(() => {
      if (lastDataRef.current > 0 && Date.now() - lastDataRef.current > SENSOR_TIMEOUT_MS) {
        setIsLive(false);
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

  // System safety based on water quality
  const phSafe          = sensorData.ph >= 6.5 && sensorData.ph <= 8.5;
  const flowRateSafe    = sensorData.flowRate >= 0.5 && sensorData.flowRate <= 10;
  const tdsSafe         = sensorData.tds <= 5000;
  const temperatureSafe = sensorData.temperature >= 10 && sensorData.temperature <= 40;
  const systemSafe      = phSafe && flowRateSafe && tdsSafe && temperatureSafe;

  // Auto pump control
  useEffect(() => {
    if (!pumpManualOverride) setPumpOn(systemSafe);
  }, [systemSafe, pumpManualOverride]);

  const handleManualOverride = () => setPumpManualOverride(prev => !prev);
  const handlePumpToggle     = () => { if (pumpManualOverride) setPumpOn(prev => !prev); };

  // Derive indicator appearance from the two independent states
  const indicator = isLive
    ? { label: 'Live',        dot: 'bg-green-500 animate-pulse', pill: 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-700 bg-green-500/10' }
    : socketConnected
    ? { label: 'No Data',     dot: 'bg-yellow-500',              pill: 'text-yellow-600 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600 bg-yellow-500/10' }
    : { label: 'Disconnected',dot: 'bg-red-500',                 pill: 'text-red-500 dark:text-red-400 border-red-500 dark:border-red-700 bg-red-500/10' };

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col lg:overflow-hidden overflow-y-auto">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="h-12 flex items-center justify-center px-8 gap-4">
          <h1 className="text-xl font-bold text-foreground">
            MFC Water Treatment Monitoring System
          </h1>
          <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${indicator.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${indicator.dot}`} />
            {indicator.label}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-2 md:p-3 min-h-0 lg:overflow-hidden overflow-y-auto">
        <div className="lg:grid lg:grid-cols-3 lg:grid-rows-[45fr_55fr] lg:gap-2 lg:h-full flex flex-col gap-2">
          {/* Pre-treatment — 2 cols on desktop */}
          <div className="min-h-[240px] lg:min-h-0 lg:col-span-2 overflow-hidden">
            <PreTreatmentPanel
              ph={sensorData.ph}
              flowRate={sensorData.flowRate}
              tds={sensorData.tds}
              salinity={sensorData.salinity}
              conductivity={sensorData.conductivity}
              temperature={sensorData.temperature}
              connected={sensorConnected}
            />
          </div>

          {/* Post-treatment */}
          <div className="min-h-[220px] lg:min-h-0 overflow-hidden">
            <PostTreatmentPanel
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
        <p>MFC Water Treatment System</p>
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
