import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth }              from '@/app/contexts/AuthContext';
import { useSettings }          from './useSettings';
import { PageHeader }           from './components/PageHeader';
import { ThresholdTable }       from './components/ThresholdTable';
import { AlertDisplaySettings } from './components/AlertDisplaySettings';
import { SystemInfo }           from './components/SystemInfo';

export default function SettingsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'operator';

  const {
    settings, draft, loading, saveState, saveError, isDirty,
    updateInterval,
    handleThreshold, handleAlertsToggle, handleUpdateInterval,
    handleSave, handleReset,
  } = useSettings();

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      <PageHeader
        isDirty={isDirty}
        saveState={saveState}
        canEdit={canEdit}
        onSave={handleSave}
        onReset={handleReset}
      />

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 min-h-0">
        {saveError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading settings…</span>
          </div>
        ) : draft && (
          <>
            <ThresholdTable
              draft={draft}
              canEdit={canEdit}
              onThresholdChange={handleThreshold}
            />
            <AlertDisplaySettings
              draft={draft}
              canEdit={canEdit}
              updateInterval={updateInterval}
              onAlertsToggle={handleAlertsToggle}
              onUpdateIntervalChange={handleUpdateInterval}
            />
            {settings && <SystemInfo settings={settings} />}
          </>
        )}
      </div>
    </div>
  );
}
