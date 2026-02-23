import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Bell, Filter } from 'lucide-react';

type Severity = 'critical' | 'warning' | 'info';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  severity: Severity;
  sensor: string;
  message: string;
  timestamp: string;
  status: AlertStatus;
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    sensor: 'pH Sensor',
    message: 'pH level dropped below safe threshold (5.8 pH < 6.5 min)',
    timestamp: '2026-02-24 14:32:10',
    status: 'active',
  },
  {
    id: '2',
    severity: 'warning',
    sensor: 'Flow Rate Sensor',
    message: 'Flow rate approaching upper limit (118.4 L/min of 120 max)',
    timestamp: '2026-02-24 14:15:00',
    status: 'active',
  },
  {
    id: '3',
    severity: 'warning',
    sensor: 'TDS Sensor',
    message: 'TDS elevated at 487 ppm — nearing 500 ppm safety limit',
    timestamp: '2026-02-24 13:50:22',
    status: 'acknowledged',
  },
  {
    id: '4',
    severity: 'info',
    sensor: 'System',
    message: 'Treatment cycle completed and restarted at stage 1',
    timestamp: '2026-02-24 13:40:00',
    status: 'resolved',
  },
  {
    id: '5',
    severity: 'critical',
    sensor: 'Temperature Sensor',
    message: 'Temperature sensor offline — no readings received for 60s',
    timestamp: '2026-02-24 13:22:05',
    status: 'resolved',
  },
  {
    id: '6',
    severity: 'info',
    sensor: 'Pump',
    message: 'Pump switched to manual override by operator',
    timestamp: '2026-02-24 12:55:11',
    status: 'resolved',
  },
];

const severityConfig = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    text: 'text-red-600 dark:text-red-400',
    icon: AlertCircle,
    label: 'Critical',
  },
  warning: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    text: 'text-orange-600 dark:text-orange-400',
    icon: AlertTriangle,
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    text: 'text-blue-600 dark:text-blue-400',
    icon: Info,
    label: 'Info',
  },
};

const statusConfig = {
  active: { text: 'text-red-500 dark:text-red-400', label: 'Active' },
  acknowledged: { text: 'text-orange-500 dark:text-orange-400', label: 'Acknowledged' },
  resolved: { text: 'text-green-500 dark:text-green-400', label: 'Resolved' },
};

type FilterKey = 'all' | Severity | AlertStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
  { key: 'active', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<FilterKey>('all');

  const acknowledge = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id && a.status === 'active' ? { ...a, status: 'acknowledged' as AlertStatus } : a))
    );
  };

  const resolve = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id && a.status !== 'resolved' ? { ...a, status: 'resolved' as AlertStatus } : a))
    );
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && a.status !== 'resolved').length;
  const activeCount = alerts.filter(a => a.status === 'active').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const filtered =
    filter === 'all'
      ? alerts
      : alerts.filter(a => a.severity === filter || a.status === filter);

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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 opacity-30" />
              <p className="text-sm">No alerts match this filter</p>
            </div>
          ) : (
            filtered.map(alert => {
              const sev = severityConfig[alert.severity];
              const Icon = sev.icon;
              const stat = statusConfig[alert.status];
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
                      <span className="text-xs text-muted-foreground">{alert.sensor}</span>
                      <span className={`ml-auto text-xs font-medium ${stat.text}`}>{stat.label}</span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{alert.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{alert.timestamp}</p>
                  </div>
                  {alert.status !== 'resolved' && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => acknowledge(alert.id)}
                          className="px-2 py-1 text-[10px] rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 transition-colors font-medium"
                        >
                          Ack
                        </button>
                      )}
                      <button
                        onClick={() => resolve(alert.id)}
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
