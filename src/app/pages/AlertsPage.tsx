import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Bell, Filter, Loader2 } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '@/app/services/api';
import type { Alert, AlertSeverity, AlertStatus } from '@/app/services/api';
import { getSocket } from '@/app/services/socket';

// ─── Display maps ─────────────────────────────────────────────────────────────

const SENSOR_LABELS: Record<string, string> = {
  ph:          'pH Sensor',
  tds:         'TDS Sensor',
  temperature: 'Temperature Sensor',
  flow_rate:   'Flow Rate Sensor',
  device:      'System',
  system:      'System',
};

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-red-500/10', border: 'border-red-500/40',
    text: 'text-red-600 dark:text-red-400', icon: AlertCircle, label: 'Critical',
  },
  warning: {
    bg: 'bg-orange-500/10', border: 'border-orange-500/40',
    text: 'text-orange-600 dark:text-orange-400', icon: AlertTriangle, label: 'Warning',
  },
  info: {
    bg: 'bg-blue-500/10', border: 'border-blue-500/40',
    text: 'text-blue-600 dark:text-blue-400', icon: Info, label: 'Info',
  },
} satisfies Record<AlertSeverity, unknown>;

const STATUS_CONFIG = {
  active:       { text: 'text-red-500 dark:text-red-400',    label: 'Active' },
  acknowledged: { text: 'text-orange-500 dark:text-orange-400', label: 'Acknowledged' },
  resolved:     { text: 'text-green-500 dark:text-green-400', label: 'Resolved' },
} satisfies Record<AlertStatus, unknown>;

type FilterKey = 'all' | AlertSeverity | AlertStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'critical',     label: 'Critical' },
  { key: 'warning',      label: 'Warning' },
  { key: 'info',         label: 'Info' },
  { key: 'active',       label: 'Active' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'resolved',     label: 'Resolved' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterKey>('all');

  // Initial load
  useEffect(() => {
    fetchAlerts(undefined, 200)
      .then(data => setAlerts(data))
      .catch(err => console.error('[AlertsPage] Failed to load alerts:', err))
      .finally(() => setLoading(false));
  }, []);

  // Real-time: prepend new alerts from Socket.io
  useEffect(() => {
    const socket = getSocket();

    const onNewAlert = (alert: Alert) => {
      setAlerts(prev => {
        // Don't duplicate if already in list
        if (prev.some(a => a.id === alert.id)) return prev;
        return [alert, ...prev];
      });
    };

    // When backend auto-resolves a sensor's alert, sync local state
    const onAlertResolved = ({ sensor }: { sensor: string }) => {
      setAlerts(prev =>
        prev.map(a =>
          a.sensor === sensor && (a.status === 'active' || a.status === 'acknowledged')
            ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() }
            : a
        )
      );
    };

    socket.on('system_alert', onNewAlert);
    socket.on('alert_resolved', onAlertResolved);
    return () => {
      socket.off('system_alert', onNewAlert);
      socket.off('alert_resolved', onAlertResolved);
    };
  }, []);

  const handleAcknowledge = useCallback(async (id: string) => {
    try {
      const updated = await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (err) {
      console.error('[AlertsPage] Acknowledge failed:', err);
    }
  }, []);

  const handleResolve = useCallback(async (id: string) => {
    try {
      const updated = await resolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (err) {
      console.error('[AlertsPage] Resolve failed:', err);
    }
  }, []);

  // ─── Derived counts ────────────────────────────────────────────────────────

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const warningCount  = alerts.filter(a => a.severity === 'warning'  && a.status !== 'resolved').length;
  const activeCount   = alerts.filter(a => a.status === 'active').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const filtered = filter === 'all'
    ? alerts
    : alerts.filter(a => a.severity === filter || a.status === filter);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-12 flex items-center px-6 border-b border-border gap-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">Alerts &amp; Notifications</h1>
        {activeCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
            {activeCount} active
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          <div className="bg-card rounded-lg p-3 border border-border flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Alerts</span>
            <span className="text-2xl font-bold text-foreground">{alerts.length}</span>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/40 flex flex-col gap-1">
            <span className="text-xs text-red-600 dark:text-red-400">Critical</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</span>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/40 flex flex-col gap-1">
            <span className="text-xs text-orange-600 dark:text-orange-400">Warnings</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{warningCount}</span>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/40 flex flex-col gap-1">
            <span className="text-xs text-green-600 dark:text-green-400">Resolved</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedCount}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Alert List */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading alerts…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 opacity-30" />
              <p className="text-sm">No alerts match this filter</p>
            </div>
          ) : (
            filtered.map(alert => {
              const sev  = SEVERITY_CONFIG[alert.severity];
              const Icon = sev.icon;
              const stat = STATUS_CONFIG[alert.status];
              const sensorLabel = SENSOR_LABELS[alert.sensor] ?? alert.sensor;

              return (
                <div
                  key={alert.id}
                  className={`${sev.bg} rounded-lg border ${sev.border} p-3 flex items-start gap-3 ${
                    alert.status === 'resolved' ? 'opacity-60' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${sev.text}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase ${sev.text}`}>{sev.label}</span>
                      <span className="text-xs text-muted-foreground">{sensorLabel}</span>
                      {alert.threshold && (
                        <span className="text-xs text-muted-foreground">· threshold: {alert.threshold}</span>
                      )}
                      <span className={`ml-auto text-xs font-medium ${stat.text}`}>{stat.label}</span>
                    </div>

                    <p className="text-sm text-foreground mt-0.5">{alert.message}</p>

                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                      {alert.resolvedAt && ` · resolved ${new Date(alert.resolvedAt).toLocaleString()}`}
                    </p>
                  </div>

                  {alert.status !== 'resolved' && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-2 py-1 text-[10px] rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 transition-colors font-medium"
                        >
                          Ack
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-2 py-1 text-[10px] rounded bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 transition-colors font-medium"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
