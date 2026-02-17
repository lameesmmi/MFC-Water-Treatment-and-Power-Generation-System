import { SensorDisplay } from './SensorDisplay';

interface Tank1PanelProps {
  ph: number;
  flowRate: number;
  tds: number;
  salinity: number;
  conductivity: number;
  temperature: number;
  connected: Record<string, boolean>;
}

export function Tank1Panel({
  ph,
  flowRate,
  tds,
  salinity,
  conductivity,
  temperature,
  connected
}: Tank1PanelProps) {
  // Determine status for each sensor
  const phStatus = !connected.ph ? 'offline' : ph >= 6.5 && ph <= 7.5 ? 'safe' : 'unsafe';
  const flowRateStatus = !connected.flowRate ? 'offline' : flowRate >= 90 && flowRate <= 120
    ? 'safe'
    : flowRate > 120
    ? 'high'
    : 'low';
  const tdsStatus = !connected.tds ? 'offline' : tds <= 500 ? 'safe' : 'high';
  const salinityStatus = !connected.salinity ? 'offline' : salinity <= 250 ? 'safe' : 'high';
  const conductivityStatus = !connected.conductivity ? 'offline' : conductivity <= 1000 ? 'safe' : 'high';
  const temperatureStatus = !connected.temperature ? 'offline' : temperature >= 18 && temperature <= 28
    ? 'safe'
    : temperature > 28
    ? 'high'
    : 'low';

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-card-foreground">Tank 1: Pre-treatment</h2>
        <p className="text-xs text-muted-foreground">Initial water quality assessment</p>
      </div>

      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2 min-h-0">
        <SensorDisplay
          label="pH Level"
          value={ph}
          unit="pH"
          status={phStatus}
          decimals={2}
        />

        <SensorDisplay
          label="Water Flow Rate"
          value={flowRate}
          unit="L/min"
          status={flowRateStatus}
          decimals={1}
        />

        <SensorDisplay
          label="TDS"
          value={tds}
          unit="ppm"
          status={tdsStatus}
          decimals={0}
        />

        <SensorDisplay
          label="Salinity"
          value={salinity}
          unit="ppm"
          status={salinityStatus}
          decimals={0}
          isDerived={true}
        />

        <SensorDisplay
          label="Conductivity"
          value={conductivity}
          unit="μS/cm"
          status={conductivityStatus}
          decimals={0}
          isDerived={true}
        />

        <SensorDisplay
          label="Temperature"
          value={temperature}
          unit="°C"
          status={temperatureStatus}
          decimals={1}
        />
      </div>
    </div>
  );
}
