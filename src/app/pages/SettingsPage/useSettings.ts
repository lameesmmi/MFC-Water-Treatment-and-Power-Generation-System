import { useState, useEffect, useCallback } from 'react';
import { fetchSettings, saveSettings, resetSettings } from '@/app/services/api';
import type { SystemSettings, ThresholdConfig }       from '@/app/services/api';
import { getSocket }  from '@/app/services/socket';
import { SensorKey }  from './constants';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseSettingsReturn {
  settings:       SystemSettings | null;
  draft:          SystemSettings | null;
  loading:        boolean;
  saveState:      SaveState;
  saveError:      string | null;
  isDirty:        boolean;
  updateInterval: number;
  handleThreshold:      (sensor: SensorKey, field: keyof ThresholdConfig, raw: string) => void;
  handleAlertsToggle:   () => void;
  handleUpdateInterval: (val: number) => void;
  handleSave:           () => Promise<void>;
  handleReset:          () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings,  setSettings]  = useState<SystemSettings | null>(null);
  const [draft,     setDraft]     = useState<SystemSettings | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const [updateInterval, setUpdateInterval] = useState<number>(() => {
    const stored = localStorage.getItem('mfc_update_interval');
    return stored ? Number(stored) : 5;
  });

  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(settings);

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

  // Socket.io: sync when another client saves settings
  useEffect(() => {
    const socket = getSocket();
    const onUpdated = (updated: SystemSettings) => {
      setSettings(updated);
      setDraft(prev => {
        if (!prev || JSON.stringify(prev) === JSON.stringify(settings)) return updated;
        return prev;
      });
    };
    socket.on('settings_updated', onUpdated);
    return () => { socket.off('settings_updated', onUpdated); };
  }, [settings]);

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
      const saved = await saveSettings({ thresholds: draft.thresholds, alertsEnabled: draft.alertsEnabled });
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

  return {
    settings, draft, loading, saveState, saveError, isDirty,
    updateInterval,
    handleThreshold, handleAlertsToggle, handleUpdateInterval,
    handleSave, handleReset,
  };
}
