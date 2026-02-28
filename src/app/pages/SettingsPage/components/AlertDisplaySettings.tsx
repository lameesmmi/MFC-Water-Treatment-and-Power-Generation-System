import { Bell } from 'lucide-react';
import type { SystemSettings } from '@/app/services/api';

interface Props {
  draft:          SystemSettings;
  canEdit:        boolean;
  updateInterval: number;
  onAlertsToggle:       () => void;
  onUpdateIntervalChange: (val: number) => void;
}

export function AlertDisplaySettings({
  draft, canEdit, updateInterval, onAlertsToggle, onUpdateIntervalChange,
}: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Alert &amp; Display Settings</h2>
      </div>

      <div className="bg-card rounded-lg border border-border divide-y divide-border">
        {/* Alert notifications toggle */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium">Alert Notifications</p>
            <p className="text-xs text-muted-foreground">Generate alerts when sensor thresholds are exceeded</p>
          </div>
          <button
            onClick={canEdit ? onAlertsToggle : undefined}
            disabled={!canEdit}
            className={`relative w-9 h-5 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              draft.alertsEnabled ? 'bg-green-500' : 'bg-muted-foreground/40'
            }`}
            aria-label="Toggle alert notifications"
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                draft.alertsEnabled ? 'left-[18px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Dashboard refresh rate (frontend-only, localStorage) */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium">Dashboard Refresh Rate</p>
            <p className="text-xs text-muted-foreground">How often the live dashboard checks for stale data (stored locally)</p>
          </div>
          <select
            value={updateInterval}
            onChange={e => onUpdateIntervalChange(Number(e.target.value))}
            className="bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors"
          >
            <option value={1}>1 second</option>
            <option value={2}>2 seconds</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
          </select>
        </div>
      </div>
    </section>
  );
}
