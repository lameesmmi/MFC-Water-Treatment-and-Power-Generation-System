import { Bell }          from 'lucide-react';
import { useAlerts }     from './useAlerts';
import { SummaryCards }  from './components/SummaryCards';
import { FilterBar }     from './components/FilterBar';
import { AlertList }     from './components/AlertList';

export default function AlertsPage() {
  const {
    alerts, pagination, loading, page, setPage,
    summary,
    severityFilter, statusFilter, sensorFilter,
    changeSeverity, changeStatus, changeSensor,
    handleAcknowledge, handleResolve,
  } = useAlerts();

  const activeUnresolved = summary.critical + summary.warning;

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
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
        <SummaryCards summary={summary} />

        <FilterBar
          severityFilter={severityFilter}
          statusFilter={statusFilter}
          sensorFilter={sensorFilter}
          changeSeverity={changeSeverity}
          changeStatus={changeStatus}
          changeSensor={changeSensor}
          page={page}
          setPage={setPage}
          pagination={pagination}
        />

        <AlertList
          loading={loading}
          alerts={alerts}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      </div>
    </div>
  );
}
