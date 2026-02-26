import { SensorDisplay } from './SensorDisplay';

interface PreTreatmentPanelProps {
  ph: number;
  flowRate: number;
  tds: number;
  salinity: number;
  conductivity: number;
  temperature: number;
  connected: Record<string, boolean>;
}

export function PreTreatmentPanel({
  ph,
  flowRate,
  tds,
  salinity,
  conductivity,
  temperature,
  connected,
}: PreTreatmentPanelProps) {
  const phStatus          = !connected.ph          ? 'offline' : ph >= 6.5 && ph <= 8.5          ? 'safe' : ph > 8.5 ? 'high' : 'low';
  const flowRateStatus    = !connected.flowRate    ? 'offline' : flowRate >= 0.5 && flowRate <= 5  ? 'safe' : flowRate > 5 ? 'high' : 'low';
  const tdsStatus         = !connected.tds         ? 'offline' : tds <= 5000                       ? 'safe' : 'high';
  const salinityStatus    = !connected.salinity    ? 'offline' : salinity <= 2000                  ? 'safe' : 'high';
  const conductivityStatus= !connected.conductivity? 'offline' : conductivity <= 4000              ? 'safe' : 'high';
  const temperatureStatus = !connected.temperature ? 'offline' : temperature >= 10 && temperature <= 40 ? 'safe' : temperature > 40 ? 'high' : 'low';

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-card-foreground">Pre-treatment</h2>
        <p className="text-xs text-muted-foreground">Influent water quality</p>
      </div>

      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2 min-h-0">
        <SensorDisplay label="pH Level"        value={ph}           unit="pH"    status={phStatus}           decimals={2} />
        <SensorDisplay label="Flow Rate"       value={flowRate}     unit="L/min" status={flowRateStatus}      decimals={2} />
        <SensorDisplay label="TDS"             value={tds}          unit="ppm"   status={tdsStatus}           decimals={0} />
        <SensorDisplay label="Salinity"        value={salinity}     unit="ppm"   status={salinityStatus}      decimals={0} isDerived />
        <SensorDisplay label="Conductivity"    value={conductivity} unit="μS/cm" status={conductivityStatus}  decimals={0} isDerived />
        <SensorDisplay label="Temperature"     value={temperature}  unit="°C"    status={temperatureStatus}   decimals={1} />
      </div>
    </div>
  );
}
