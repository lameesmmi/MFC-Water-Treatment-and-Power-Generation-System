import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Settings, Sliders, Bell, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { fetchSettings, saveSettings, resetSettings } from '@/app/services/api';
import type { SystemSettings, ThresholdConfig } from '@/app/services/api';
import { getSocket } from '@/app/services/socket';
import { useAuth } from '@/app/contexts/AuthContext';
import { format } from 'date-fns';

// ─── Static metadata ──────────────────────────────────────────────────────────

interface SensorMeta {
  label: string;
  unit:  string;
  absMin: number;
  absMax: number;
  step:   number;
}

const SENSOR_META: Record<keyof SystemSettings['thresholds'], SensorMeta> = {
  ph:          { label: 'pH Level',    unit: 'pH',    absMin: 0,  absMax: 14,    step: 0.1 },
  tds:         { label: 'TDS',         unit: 'ppm',   absMin: 0,  absMax: 10000, step: 10  },
  temperature: { label: 'Temperature', unit: '°C',    absMin: 0,  absMax: 60,    step: 0.5 },
  flow_rate:   { label: 'Flow Rate',   unit: 'L/min', absMin: 0,  absMax: 20,    step: 0.1 },
  voltage:     { label: 'Voltage',     unit: 'V',     absMin: 0,  absMax: 50,    step: 0.1 },
  current:     { label: 'Current',     unit: 'A',     absMin: 0,  absMax: 10,    step: 0.1 },
};

type SensorKey = keyof SystemSettings['thresholds'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'operator';

  // ── Remote state (persisted in MongoDB) ─────────────────────────────────────
  const [settings,    setSettings]    = useState<SystemSettings | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [saveState,   setSaveState]   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // ── Local draft (what the user is currently editing) ─────────────────────────
  const [draft, setDraft] = useState<SystemSettings | null>(null);
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(settings);

  // ── Frontend-only settings (localStorage) ───────────────────────────────────
  const [updateInterval, setUpdateInterval] = useState<number>(() => {
    const stored = localStorage.getItem('mfc_update_interval');
    return stored ? Number(stored) : 5;
  });

  // ─── Load settings from backend on mount ────────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
      setDraft(data);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ─── Socket.io: sync when another client saves settings ─────────────────────
  useEffect(() => {
    const socket = getSocket();
    const onUpdated = (updated: SystemSettings) => {
      setSettings(updated);
      setDraft(prev => {
        // Only overwrite draft if user has no unsaved changes
        if (!prev || JSON.stringify(prev) === JSON.stringify(settings)) return updated;
        return prev;
      });
    };
    socket.on('settings_updated', onUpdated);
    return () => { socket.off('settings_updated', onUpdated); };
  }, [settings]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleThreshold = (sensor: SensorKey, field: keyof ThresholdConfig, raw: string) => {
    if (!draft) return;
    const val = field === 'severity' ? raw : parseFloat(raw);
    if (field !== 'severity' && isNaN(val as number)) return;
    setDraft(prev => prev ? ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [sensor]: { ...prev.thresholds[sensor], [field]: val },
      },
    }) : prev);
    setSaveState('idle');
    setSaveError(null);
  };

  const handleAlertsToggle = () => {
    setDraft(prev => prev ? { ...prev, alertsEnabled: !prev.alertsEnabled } : prev);
    setSaveState('idle');
    setSaveError(null);
  };

  const handleUpdateInterval = (val: number) => {
    setUpdateInterval(val);
    localStorage.setItem('mfc_update_interval', String(val));
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const saved = await saveSettings({
        thresholds:    draft.thresholds,
        alertsEnabled: draft.alertsEnabled,
      });
      setSettings(saved);
      setDraft(saved);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveError((err as Error).message);
      setSaveState('error');
    }
  };

  const handleReset = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      const defaults = await resetSettings();
      setSettings(defaults);
      setDraft(defaults);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveError((err as Error).message);
      setSaveState('error');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">System Settings</h1>
          {isDirty && (
            <span className="text-xs text-orange-500 dark:text-orange-400 font-medium">
              · unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canEdit ? (
            <>
              <button
                onClick={handleReset}
                disabled={saveState === 'saving'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || saveState === 'saving'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                  saveState === 'saved'  ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                  saveState === 'error'  ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                  'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {saveState === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : 'Save Changes'}
              </button>
            </>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              Read-only
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 min-h-0">

        {/* Error banner */}
        {saveError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading settings…</span>
          </div>
        ) : draft && (
          <>
            {/* ── Sensor Safety Thresholds ─────────────────────────────────── */}
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
                      const meta = SENSOR_META[key];
                      const val  = draft.thresholds[key];
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
                              onChange={e => handleThreshold(key, 'min', e.target.value)}
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
                              onChange={e => handleThreshold(key, 'max', e.target.value)}
                              className={`w-24 bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                                minErr ? 'border-destructive' : 'border-border'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <select
                              value={val.severity}
                              disabled={!canEdit}
                              onChange={e => handleThreshold(key, 'severity', e.target.value)}
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

            {/* ── Alert & Display Settings ──────────────────────────────────── */}
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
                    onClick={canEdit ? handleAlertsToggle : undefined}
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

                {/* Update interval (frontend-only) */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Dashboard Refresh Rate</p>
                    <p className="text-xs text-muted-foreground">How often the live dashboard checks for stale data (stored locally)</p>
                  </div>
                  <select
                    value={updateInterval}
                    onChange={e => handleUpdateInterval(Number(e.target.value))}
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

            {/* ── System Information ────────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">System Information</h2>
              </div>

              <div className="bg-card rounded-lg border border-border divide-y divide-border">
                {[
                  { label: 'System Name',         value: 'MFC Water Treatment System' },
                  { label: 'Device ID',           value: 'MFC_01' },
                  { label: 'Location',            value: 'Dammam Lab' },
                  { label: 'Backend URL',         value: import.meta.env.VITE_BACKEND_URL },
                  { label: 'Sensors Monitored',   value: `${Object.keys(SENSOR_META).length}` },
                  { label: 'Alert Notifications', value: settings?.alertsEnabled ? 'Enabled' : 'Disabled' },
                  { label: 'Last Settings Update', value: settings?.updatedAt ? format(new Date(settings.updatedAt), 'PPp') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
