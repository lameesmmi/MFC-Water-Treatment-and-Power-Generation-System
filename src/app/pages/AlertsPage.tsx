import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Bell, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '@/app/services/api';
import type { Alert, AlertSeverity, AlertStatus, AlertSensor } from '@/app/services/api';
import { getSocket } from '@/app/services/socket';

// ─── Display maps ─────────────────────────────────────────────────────────────

const SENSOR_LABELS: Record<string, string> = {
  ph:          'pH Sensor',
  tds:         'TDS Sensor',
  temperature: 'Temperature Sensor',
  flow_rate:   'Flow Rate Sensor',
  device:      'System',
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
  active:       { text: 'text-red-500 dark:text-red-400',       label: 'Active'       },
  acknowledged: { text: 'text-orange-500 dark:text-orange-400', label: 'Acknowledged' },
  resolved:     { text: 'text-green-500 dark:text-green-400',   label: 'Resolved'     },
} satisfies Record<AlertStatus, unknown>;

// ─── Filter option definitions ────────────────────────────────────────────────

const SEVERITY_OPTIONS: { value: AlertSeverity; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning',  label: 'Warning'  },
  { value: 'info',     label: 'Info'     },
];

const STATUS_OPTIONS: { value: AlertStatus; label: string }[] = [
  { value: 'active',       label: 'Active'       },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved',     label: 'Resolved'     },
];

const SENSOR_OPTIONS: { value: AlertSensor; label: string }[] = [
  { value: 'ph',          label: 'pH'        },
  { value: 'tds',         label: 'TDS'       },
  { value: 'temperature', label: 'Temp'      },
  { value: 'flow_rate',   label: 'Flow Rate' },
  { value: 'device',      label: 'System'    },
];

const LIMIT = 20;

// ─── FilterGroup ──────────────────────────────────────────────────────────────

function toggleValue<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function FilterGroup<T extends string>({
  label,
  options,
  active,
  onChange,
}: {
  label:    string;
  options:  { value: T; label: string }[];
  active:   T[];
  onChange: (vals: T[]) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          active.length === 0
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-secondary'
        }`}
      >
        All
      </button>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(toggleValue(active, opt.value))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            active.includes(opt.value)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: LIMIT });
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);

  const [severityFilter, setSeverityFilter] = useState<AlertSeverity[]>([]);
  const [statusFilter,   setStatusFilter]   = useState<AlertStatus[]>([]);
  const [sensorFilter,   setSensorFilter]   = useState<AlertSensor[]>([]);

  // Global counts — fetched once on mount, updated optimistically on actions
  const [summary, setSummary] = useState({ total: 0, critical: 0, warning: 0, resolved: 0 });

  // ─── Summary counts (unfiltered, fetched once) ────────────────────────────

  useEffect(() => {
    Promise.all([
      fetchAlerts({ limit: 1 }),
      fetchAlerts({ severity: 'critical', status: ['active', 'acknowledged'], limit: 1 }),
      fetchAlerts({ severity: 'warning',  status: ['active', 'acknowledged'], limit: 1 }),
      fetchAlerts({ status: 'resolved', limit: 1 }),
    ])
      .then(([all, crit, warn, res]) => {
        setSummary({
          total:    all.pagination?.total    ?? 0,
          critical: crit.pagination?.total   ?? 0,
          warning:  warn.pagination?.total   ?? 0,
          resolved: res.pagination?.total    ?? 0,
        });
      })
      .catch(err => console.error('[AlertsPage] Failed to load summary:', err));
  }, []);

  // ─── Paginated / filtered list ────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchAlerts({
      severity: severityFilter.length ? severityFilter : undefined,
      status:   statusFilter.length   ? statusFilter   : undefined,
      sensor:   sensorFilter.length   ? sensorFilter   : undefined,
      page,
      limit: LIMIT,
    })
      .then(res => {
        if (!cancelled) {
          setAlerts(res.data ?? []);
          setPagination(res.pagination ?? { total: 0, page: 1, pages: 1, limit: LIMIT });
        }
      })
      .catch(err => console.error('[AlertsPage] Failed to load alerts:', err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [severityFilter, statusFilter, sensorFilter, page]);

  // ─── Real-time Socket.io events ───────────────────────────────────────────

  useEffect(() => {
    const socket = getSocket();

    const onNewAlert = (alert: Alert) => {
      // Update global summary counts
      setSummary(prev => ({
        ...prev,
        total:    prev.total + 1,
        critical: alert.severity === 'critical' ? prev.critical + 1 : prev.critical,
        warning:  alert.severity === 'warning'  ? prev.warning  + 1 : prev.warning,
      }));

      // Prepend to list only on page 1 when it matches current filters
      if (page === 1) {
        const matchesSeverity = severityFilter.length === 0 || severityFilter.includes(alert.severity);
        const matchesStatus   = statusFilter.length   === 0 || statusFilter.includes(alert.status);
        const matchesSensor   = sensorFilter.length   === 0 || sensorFilter.includes(alert.sensor);
        if (matchesSeverity && matchesStatus && matchesSensor) {
          setAlerts(prev => {
            if (prev.some(a => a.id === alert.id)) return prev;
            return [alert, ...prev.slice(0, LIMIT - 1)];
          });
        }
      }
    };

    const onAlertResolved = ({ sensor }: { sensor: string }) => {
      setAlerts(prev =>
        prev.map(a =>
          a.sensor === sensor && (a.status === 'active' || a.status === 'acknowledged')
            ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() }
            : a
        )
      );
      setSummary(prev => ({ ...prev, resolved: prev.resolved + 1 }));
    };

    socket.on('system_alert', onNewAlert);
    socket.on('alert_resolved', onAlertResolved);
    return () => {
      socket.off('system_alert', onNewAlert);
      socket.off('alert_resolved', onAlertResolved);
    };
  }, [page, severityFilter, statusFilter, sensorFilter]);

  // ─── Actions ──────────────────────────────────────────────────────────────

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
      setSummary(prev => ({ ...prev, resolved: prev.resolved + 1 }));
    } catch (err) {
      console.error('[AlertsPage] Resolve failed:', err);
    }
  }, []);

  // ─── Filter change handlers (always reset to page 1) ─────────────────────

  const changeSeverity = (vals: AlertSeverity[]) => { setPage(1); setSeverityFilter(vals); };
  const changeStatus   = (vals: AlertStatus[])   => { setPage(1); setStatusFilter(vals);   };
  const changeSensor   = (vals: AlertSensor[])   => { setPage(1); setSensorFilter(vals);   };

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeUnresolved = summary.critical + summary.warning;

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-12 flex items-center px-6 border-b border-border gap-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">Alerts &amp; Notifications</h1>
        {activeUnresolved > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
            {activeUnresolved} active
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          <div className="bg-card rounded-lg p-3 border border-border flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total Alerts</span>
            <span className="text-2xl font-bold text-foreground">{summary.total}</span>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/40 flex flex-col gap-1">
            <span className="text-xs text-red-600 dark:text-red-400">Critical</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.critical}</span>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/40 flex flex-col gap-1">
            <span className="text-xs text-orange-600 dark:text-orange-400">Warnings</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.warning}</span>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/40 flex flex-col gap-1">
            <span className="text-xs text-green-600 dark:text-green-400">Resolved</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.resolved}</span>
          </div>
        </div>

        {/* Filter Bar + Pagination */}
        <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters</span>
          </div>
          <FilterGroup label="Severity" options={SEVERITY_OPTIONS} active={severityFilter} onChange={changeSeverity} />
          <FilterGroup label="Status"   options={STATUS_OPTIONS}   active={statusFilter}   onChange={changeStatus}   />
          <FilterGroup label="Sensor"   options={SENSOR_OPTIONS}   active={sensorFilter}   onChange={changeSensor}   />

          {/* Pagination — kept near filters for easy reach */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-1 border-t border-border mt-0.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-xs text-muted-foreground">
                Page {page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total} result{pagination.total !== 1 ? 's' : ''}
              </span>

              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Alert List */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading alerts…</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 opacity-30" />
              <p className="text-sm">No alerts match this filter</p>
            </div>
          ) : (
            alerts.map(alert => {
              const sev         = SEVERITY_CONFIG[alert.severity];
              const Icon        = sev.icon;
              const stat        = STATUS_CONFIG[alert.status];
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
