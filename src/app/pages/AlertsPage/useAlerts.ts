import { useState, useEffect, useCallback } from 'react';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '@/app/services/api';
import type { Alert, AlertSeverity, AlertStatus, AlertSensor } from '@/app/services/api';
import { getSocket } from '@/app/services/socket';
import { LIMIT } from './constants';

interface AlertSummary {
  total:    number;
  critical: number;
  warning:  number;
  resolved: number;
}

interface Pagination {
  total: number;
  page:  number;
  pages: number;
  limit: number;
}

interface UseAlertsReturn {
  alerts:         Alert[];
  pagination:     Pagination;
  loading:        boolean;
  page:           number;
  setPage:        (p: number) => void;
  summary:        AlertSummary;
  severityFilter: AlertSeverity[];
  statusFilter:   AlertStatus[];
  sensorFilter:   AlertSensor[];
  changeSeverity: (vals: AlertSeverity[]) => void;
  changeStatus:   (vals: AlertStatus[])   => void;
  changeSensor:   (vals: AlertSensor[])   => void;
  handleAcknowledge: (id: string) => Promise<void>;
  handleResolve:     (id: string) => Promise<void>;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1, limit: LIMIT });
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);

  const [severityFilter, setSeverityFilter] = useState<AlertSeverity[]>([]);
  const [statusFilter,   setStatusFilter]   = useState<AlertStatus[]>([]);
  const [sensorFilter,   setSensorFilter]   = useState<AlertSensor[]>([]);

  const [summary, setSummary] = useState<AlertSummary>({ total: 0, critical: 0, warning: 0, resolved: 0 });

  // Fetch unfiltered summary counts once on mount
  useEffect(() => {
    Promise.all([
      fetchAlerts({ limit: 1 }),
      fetchAlerts({ severity: 'critical', status: ['active', 'acknowledged'], limit: 1 }),
      fetchAlerts({ severity: 'warning',  status: ['active', 'acknowledged'], limit: 1 }),
      fetchAlerts({ status: 'resolved', limit: 1 }),
    ])
      .then(([all, crit, warn, res]) => {
        setSummary({
          total:    all.pagination?.total  ?? 0,
          critical: crit.pagination?.total ?? 0,
          warning:  warn.pagination?.total ?? 0,
          resolved: res.pagination?.total  ?? 0,
        });
      })
      .catch(err => console.error('[AlertsPage] Failed to load summary:', err));
  }, []);

  // Fetch paginated + filtered list whenever filters or page change
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

  // Real-time socket events
  useEffect(() => {
    const socket = getSocket();

    const onNewAlert = (alert: Alert) => {
      setSummary(prev => ({
        ...prev,
        total:    prev.total + 1,
        critical: alert.severity === 'critical' ? prev.critical + 1 : prev.critical,
        warning:  alert.severity === 'warning'  ? prev.warning  + 1 : prev.warning,
      }));

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

    socket.on('system_alert',   onNewAlert);
    socket.on('alert_resolved', onAlertResolved);
    return () => {
      socket.off('system_alert',   onNewAlert);
      socket.off('alert_resolved', onAlertResolved);
    };
  }, [page, severityFilter, statusFilter, sensorFilter]);

  // Actions
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

  // Filter change handlers — always reset to page 1
  const changeSeverity = (vals: AlertSeverity[]) => { setPage(1); setSeverityFilter(vals); };
  const changeStatus   = (vals: AlertStatus[])   => { setPage(1); setStatusFilter(vals);   };
  const changeSensor   = (vals: AlertSensor[])   => { setPage(1); setSensorFilter(vals);   };

  return {
    alerts, pagination, loading, page, setPage,
    summary,
    severityFilter, statusFilter, sensorFilter,
    changeSeverity, changeStatus, changeSensor,
    handleAcknowledge, handleResolve,
  };
}
