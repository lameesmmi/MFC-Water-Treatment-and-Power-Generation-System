import { Sliders }   from 'lucide-react';
import type { SystemSettings, ThresholdConfig } from '@/app/services/api';
import { SENSOR_META } from '../constants';
import type { SensorKey } from '../constants';

interface Props {
  draft:           SystemSettings;
  canEdit:         boolean;
  onThresholdChange: (sensor: SensorKey, field: keyof ThresholdConfig, raw: string) => void;
}

export function ThresholdTable({ draft, canEdit, onThresholdChange }: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Sliders className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Sensor Safety Thresholds</h2>
        <span className="text-xs text-muted-foreground">— readings outside these ranges trigger alerts</span>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2 w-36">Sensor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2 w-16">Unit</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Min</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Max</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Severity</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(SENSOR_META) as SensorKey[]).map((key, i) => {
              const meta   = SENSOR_META[key];
              const val    = draft.thresholds[key];
              const minErr = val.min > val.max;

              return (
                <tr key={key} className={i % 2 !== 0 ? 'bg-muted/20' : ''}>
                  <td className="px-4 py-2.5 text-sm font-medium">{meta.label}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{meta.unit}</td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      value={val.min}
                      min={meta.absMin}
                      max={meta.absMax}
                      step={meta.step}
                      disabled={!canEdit}
                      onChange={e => onThresholdChange(key, 'min', e.target.value)}
                      className={`w-24 bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        minErr ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      value={val.max}
                      min={meta.absMin}
                      max={meta.absMax}
                      step={meta.step}
                      disabled={!canEdit}
                      onChange={e => onThresholdChange(key, 'max', e.target.value)}
                      className={`w-24 bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        minErr ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={val.severity}
                      disabled={!canEdit}
                      onChange={e => onThresholdChange(key, 'severity', e.target.value)}
                      className="bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
