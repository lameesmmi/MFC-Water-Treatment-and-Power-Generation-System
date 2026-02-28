interface IndicatorConfig {
  label: string;
  dot:   string;
  pill:  string;
}

interface Props {
  isLive:          boolean;
  socketConnected: boolean;
}

function deriveIndicator(isLive: boolean, socketConnected: boolean): IndicatorConfig {
  if (isLive)          return { label: 'Live',         dot: 'bg-green-500 animate-pulse', pill: 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-700 bg-green-500/10' };
  if (socketConnected) return { label: 'No Data',      dot: 'bg-yellow-500',              pill: 'text-yellow-600 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600 bg-yellow-500/10' };
  return               { label: 'Disconnected',        dot: 'bg-red-500',                 pill: 'text-red-500 dark:text-red-400 border-red-500 dark:border-red-700 bg-red-500/10' };
}

export function DashboardHeader({ isLive, socketConnected }: Props) {
  const indicator = deriveIndicator(isLive, socketConnected);

  return (
    <header className="flex-shrink-0 border-b border-border">
      <div className="h-12 flex items-center justify-center px-8 gap-4">
        <h1 className="text-xl font-bold text-foreground">
          MFC Water Treatment Monitoring System
        </h1>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${indicator.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${indicator.dot}`} />
          {indicator.label}
        </div>
      </div>
    </header>
  );
}
