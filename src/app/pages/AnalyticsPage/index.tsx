import { useState }         from 'react';
import { format }          from 'date-fns';
import { Zap, Activity, CheckCircle2, Loader2, CalendarDays, X } from 'lucide-react';
import { useAnalytics }    from './useAnalytics';
import { rangeLabel }      from './utils';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { KpiCard }         from './components/KpiCard';
import { MainCharts }      from './components/MainCharts';
import { AlertStats }      from './components/AlertStats';
import { downloadReadingsCsv } from '@/app/services/export';

export default function AnalyticsPage() {
  const {
    range, dateRange, popoverOpen, setPopoverOpen,
    data, loading, error,
    handleDateSelect, handlePresetClick,
  } = useAnalytics();

  const currentRangeLabel = rangeLabel(range, dateRange);

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError,   setExportError]   = useState<string | null>(null);

  const handleExportCsv = async () => {
    setExportLoading(true);
    setExportError(null);
    try {
      await downloadReadingsCsv(
        range === 'custom'
          ? { customFrom: dateRange!.from, customTo: dateRange!.to }
          : { range }
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      <AnalyticsHeader
        range={range}
        dateRange={dateRange}
        popoverOpen={popoverOpen}
        setPopoverOpen={setPopoverOpen}
        onPresetClick={handlePresetClick}
        onDateSelect={handleDateSelect}
        onExportCsv={handleExportCsv}
        exportLoading={exportLoading}
        exportDisabled={loading || exportLoading || (range === 'custom' && !(dateRange?.from && dateRange?.to))}
      />

      {exportError && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex-shrink-0 print:hidden">
          <span className="flex-1">Export failed: {exportError}</span>
          <button onClick={() => setExportError(null)} aria-label="Dismiss export error">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Print-only header */}
      <div className="hidden print:block px-6 py-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold text-gray-900">MFC Water Treatment — Analytics Report</h1>
        <p className="text-sm text-gray-600 mt-1">
          Period: <strong>{currentRangeLabel}</strong>
          &nbsp;·&nbsp;Generated: {format(new Date(), 'PPpp')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto print:overflow-visible p-4 flex flex-col gap-4 min-h-0">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading analytics…</span>
          </div>
        )}

        {!loading && range === 'custom' && !(dateRange?.from && dateRange?.to) && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <CalendarDays className="w-10 h-10 opacity-30" />
            <p className="text-sm">Select a start and end date to load the report</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            Failed to load analytics: {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
              <KpiCard
                label="Total Readings"
                value={String(data.summary.totalReadings)}
                unit="records"
                icon={Activity}
                color="text-blue-500 dark:text-blue-400"
                bg="bg-blue-500/10"
                border="border-blue-500/40"
              />
              <KpiCard
                label="EOR Pass Rate"
                value={data.summary.eorPassRate !== null ? data.summary.eorPassRate.toFixed(1) : '—'}
                unit={data.summary.eorPassRate !== null ? '%' : ''}
                icon={CheckCircle2}
                color="text-green-500 dark:text-green-400"
                bg="bg-green-500/10"
                border="border-green-500/40"
              />
              <KpiCard
                label="Total Energy"
                value={data.summary.totalEnergyWh.toFixed(3)}
                unit="Wh"
                icon={Zap}
                color="text-yellow-500 dark:text-yellow-400"
                bg="bg-yellow-500/10"
                border="border-yellow-500/40"
              />
              <KpiCard
                label="Avg Power"
                value={data.summary.avgPowerW.toFixed(3)}
                unit="W"
                icon={Activity}
                color="text-purple-500 dark:text-purple-400"
                bg="bg-purple-500/10"
                border="border-purple-500/40"
              />
            </div>

            <MainCharts data={data} />
            <AlertStats  data={data} />
          </>
        )}
      </div>
    </div>
  );
}
