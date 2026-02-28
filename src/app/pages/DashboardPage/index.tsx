import { useEffect, useState } from 'react';
import { PreTreatmentPanel }  from '@/app/components/PreTreatmentPanel';
import { PostTreatmentPanel } from '@/app/components/PostTreatmentPanel';
import { PumpControlPanel }   from '@/app/components/PumpControlPanel';
import { HistoricalPanel }    from '@/app/components/HistoricalPanel';
import { fetchHistoricalReadings, sendPumpCommand } from '@/app/services/api';
import type { PumpCommand }   from '@/app/services/api';
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
    pumpMode, setPumpMode,
  } = useLiveTelemetry();

  const [historicalSeed, setHistoricalSeed] = useState(historicalData);
  const [isPumpSending, setIsPumpSending]   = useState(false);

  // Seed historical panel from the API on mount
  useEffect(() => {
    fetchHistoricalReadings(100)
      .then(data => setHistoricalSeed(data))
      .catch(err  => console.warn('[Dashboard] Failed to fetch historical data:', err));
  }, []);

  // Merge live-data into the seed once socket data starts arriving
  const mergedHistorical = historicalData.length > 0 ? historicalData : historicalSeed;

  // System safety checks based on water quality thresholds
  const phSafe          = sensorData.ph >= 6.5 && sensorData.ph <= 8.5;
  const flowRateSafe    = sensorData.flowRate >= 0.5 && sensorData.flowRate <= 10;
  const tdsSafe         = sensorData.tds <= 5000;
  const temperatureSafe = sensorData.temperature >= 10 && sensorData.temperature <= 40;
  const systemSafe      = phSafe && flowRateSafe && tdsSafe && temperatureSafe;

  // Send a pump command (optimistic update + API call)
  const handlePumpCommand = async (command: PumpCommand) => {
    setIsPumpSending(true);
    try {
      await sendPumpCommand(command);
      setPumpMode(command);
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
