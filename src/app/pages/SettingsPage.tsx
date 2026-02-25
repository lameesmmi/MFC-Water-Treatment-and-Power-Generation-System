import { useState } from 'react';
import { Save, RotateCcw, Settings, Sliders, Bell, Monitor } from 'lucide-react';

interface ThresholdMeta {
  label: string;
  unit: string;
  absMin: number;
  absMax: number;
  step: number;
}

const SENSOR_META: Record<string, ThresholdMeta> = {
  ph:          { label: 'pH Level',    unit: 'pH',    absMin: 0,  absMax: 14, step: 0.1 },
  flowRate:    { label: 'Flow Rate',   unit: 'L/min', absMin: 0,  absMax: 20, step: 0.1 },
  tds:         { label: 'TDS',         unit: 'ppm',   absMin: 0,  absMax: 10000, step: 10 },
  temperature: { label: 'Temperature', unit: '°C',    absMin: 0,  absMax: 60, step: 0.5 },
  voltage:     { label: 'Voltage',     unit: 'V',     absMin: 0,  absMax: 50, step: 0.1 },
  current:     { label: 'Current',     unit: 'A',     absMin: 0,  absMax: 10, step: 0.1 },
};

const DEFAULT_THRESHOLDS = {
  ph:          { min: 6.5, max: 8.5 },
  flowRate:    { min: 0.5, max: 5   },
  tds:         { min: 0,   max: 5000 },
  temperature: { min: 10,  max: 40  },
  voltage:     { min: 0,   max: 50  },
  current:     { min: 0,   max: 5   },
};

type ThresholdKey = keyof typeof DEFAULT_THRESHOLDS;
type ThresholdValues = typeof DEFAULT_THRESHOLDS;

export default function SettingsPage() {
  const [thresholds, setThresholds] = useState<ThresholdValues>(DEFAULT_THRESHOLDS);
  const [updateInterval, setUpdateInterval] = useState(1);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleThreshold = (sensor: ThresholdKey, bound: 'min' | 'max', raw: string) => {
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      setThresholds(prev => ({ ...prev, [sensor]: { ...prev[sensor], [bound]: val } }));
      setSaved(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setUpdateInterval(1);
    setAlertsEnabled(true);
    setSaved(false);
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">System Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              saved
                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 min-h-0">
        {/* Sensor Thresholds */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Sensor Safety Thresholds</h2>
            <span className="text-xs text-muted-foreground">— values outside these ranges trigger alerts</span>
          </div>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Sensor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Unit</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Min</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Max</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(SENSOR_META) as ThresholdKey[]).map((key, i) => {
                  const meta = SENSOR_META[key];
                  return (
                    <tr key={key} className={i % 2 !== 0 ? 'bg-muted/20' : ''}>
                      <td className="px-4 py-2.5 text-sm font-medium">{meta.label}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{meta.unit}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={thresholds[key].min}
                          min={meta.absMin}
                          max={meta.absMax}
                          step={meta.step}
                          onChange={e => handleThreshold(key, 'min', e.target.value)}
                          className="w-24 bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={thresholds[key].max}
                          min={meta.absMin}
                          max={meta.absMax}
                          step={meta.step}
                          onChange={e => handleThreshold(key, 'max', e.target.value)}
                          className="w-24 bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Display & Notifications */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Display &amp; Notifications</h2>
          </div>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {/* Update Interval */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Data Update Interval</p>
                <p className="text-xs text-muted-foreground">How often live sensor data refreshes</p>
              </div>
              <select
                value={updateInterval}
                onChange={e => { setUpdateInterval(Number(e.target.value)); setSaved(false); }}
                className="bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors"
              >
                <option value={1}>1 second</option>
                <option value={2}>2 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>

            {/* Alert Notifications toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Alert Notifications</p>
                <p className="text-xs text-muted-foreground">Show alerts when thresholds are exceeded</p>
              </div>
              <button
                onClick={() => { setAlertsEnabled(p => !p); setSaved(false); }}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  alertsEnabled ? 'bg-green-500' : 'bg-muted-foreground/40'
                }`}
                aria-label="Toggle alert notifications"
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    alertsEnabled ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* System Info */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">System Information</h2>
          </div>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {[
              { label: 'System Name',       value: 'MFC Water Treatment System' },
              { label: 'Frontend Version',  value: '1.0.0' },
              { label: 'Sensors Monitored', value: '8' },
              { label: 'Data Update Cycle', value: `${updateInterval}s` },
              { label: 'Alert Notifications', value: alertsEnabled ? 'Enabled' : 'Disabled' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
