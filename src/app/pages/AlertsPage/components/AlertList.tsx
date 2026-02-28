import { Loader2, CheckCircle2 } from 'lucide-react';
import type { Alert }            from '@/app/services/api';
import { AlertCard }             from './AlertCard';

interface Props {
  loading:          boolean;
  alerts:           Alert[];
  onAcknowledge:    (id: string) => void;
  onResolve:        (id: string) => void;
}

export function AlertList({ loading, alerts, onAcknowledge, onResolve }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading alerts…</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 opacity-30" />
        <p className="text-sm">No alerts match this filter</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}
