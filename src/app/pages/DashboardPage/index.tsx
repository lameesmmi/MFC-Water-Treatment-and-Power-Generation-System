import { useEffect, useState } from 'react';
import { PreTreatmentPanel }  from '@/app/components/PreTreatmentPanel';
import { PostTreatmentPanel } from '@/app/components/PostTreatmentPanel';
import { PumpControlPanel }   from '@/app/components/PumpControlPanel';
import { HistoricalPanel }    from '@/app/components/HistoricalPanel';
import { fetchHistoricalReadings, sendPumpCommand, fetchSettings } from '@/app/services/api';
import type { PumpCommand, SystemSettings } from '@/app/services/api';
import { getSocket } from '@/app/services/socket';
import { useAuth }            from '@/app/contexts/AuthContext';
import { useLiveTelemetry }   from './useLiveTelemetry';
import { DashboardHeader }    from './components/DashboardHeader';
import { DashboardFooter }    from './components/DashboardFooter';

export default function DashboardPage() {
  const { user } = useAuth();

  // Only operators and admins may send pump commands
  const canControl = user?.role === 'admin' || user?.role === 'operator';

  const {
    socketConnected, isLive,
    sensorData, sensorConnected, valveStatus,
    flowHistory, historicalData,
    pumpMode,
  } = useLiveTelemetry();

  const [historicalSeed, setHistoricalSeed] = useState(historicalData);
  const [isPumpSending, setIsPumpSending]   = useState(false);

  // Thresholds loaded from Settings — seeded with safe defaults until the API responds.
  const [thresholds, setThresholds] = useState<SystemSettings['thresholds']>({
    ph:          { min: 6.5,  max: 8.5,  severity: 'warning' },
    tds:         { min: 0,    max: 5000, severity: 'warning' },
    temperature: { min: 10,   max: 40,   severity: 'warning' },
    flow_rate:   { min: 0.5,  max: 10,   severity: 'warning' },
    voltage:     { min: 0,    max: 50,   severity: 'warning' },
    current:     { min: 0,    max: 5,    severity: 'warning' },
  });

  // Seed historical panel from the API on mount; also load thresholds.
  useEffect(() => {
    fetchHistoricalReadings(100)
      .then(data => setHistoricalSeed(data))
      .catch(err  => console.warn('[Dashboard] Failed to fetch historical data:', err));

    fetchSettings()
      .then(s => setThresholds(s.thresholds))
      .catch(err => console.warn('[Dashboard] Failed to load thresholds:', err));
  }, []);

  // Keep thresholds in sync when another user saves settings.
  useEffect(() => {
    const socket = getSocket();
    const onSettingsUpdated = (updated: SystemSettings) => setThresholds(updated.thresholds);
    socket.on('settings_updated', onSettingsUpdated);
    return () => { socket.off('settings_updated', onSettingsUpdated); };
  }, []);

  // Merge live-data into the seed once socket data starts arriving
  const mergedHistorical = historicalData.length > 0 ? historicalData : historicalSeed;

  // System safety checks using user-configured thresholds (not hardcoded).
  const phSafe          = sensorData.ph >= thresholds.ph.min && sensorData.ph <= thresholds.ph.max;
  const flowRateSafe    = sensorData.flowRate >= thresholds.flow_rate.min && sensorData.flowRate <= thresholds.flow_rate.max;
  const tdsSafe         = sensorData.tds <= thresholds.tds.max;
  const temperatureSafe = sensorData.temperature >= thresholds.temperature.min && sensorData.temperature <= thresholds.temperature.max;
  const systemSafe      = phSafe && flowRateSafe && tdsSafe && temperatureSafe;

  // Send a pump command.
  // The toggle only moves once the broker echoes the message back and
  // mqttListener emits pump_command over Socket.io — no optimistic update.
  const handlePumpCommand = async (command: PumpCommand) => {
    setIsPumpSending(true);
    try {
      await sendPumpCommand(command);
    } catch (err) {
      console.error('[Dashboard] Pump command failed:', err);
    } finally {
      setIsPumpSending(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col lg:overflow-hidden overflow-y-auto">
      <DashboardHeader isLive={isLive} socketConnected={socketConnected} />

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
            <HistoricalPanel historicalData={mergedHistorical} />
          </div>

          {/* Pump control */}
          <div className="min-h-[320px] lg:min-h-0 overflow-hidden">
            <PumpControlPanel
              pumpMode={pumpMode}
              flowRate={sensorData.flowRate}
              flowHistory={flowHistory}
              systemSafe={systemSafe}
              isSending={isPumpSending}
              canControl={canControl}
              onCommand={handlePumpCommand}
            />
          </div>
        </div>
      </div>

      <DashboardFooter valveStatus={valveStatus} />
    </div>
  );
}
