interface Props {
  valveStatus: 'OPEN' | 'CLOSED' | null;
}

export function DashboardFooter({ valveStatus }: Props) {
  return (
    <footer className="h-8 flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground border-t border-border">
      <p>MFC Water Treatment System</p>
      {valveStatus && (
        <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-semibold ${
          valveStatus === 'OPEN'
            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          Valve: {valveStatus}
        </span>
      )}
    </footer>
  );
}
