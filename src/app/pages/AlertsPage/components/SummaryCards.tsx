interface Summary {
  total:    number;
  critical: number;
  warning:  number;
  resolved: number;
}

interface Props {
  summary: Summary;
}

export function SummaryCards({ summary }: Props) {
  return (
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
  );
}
