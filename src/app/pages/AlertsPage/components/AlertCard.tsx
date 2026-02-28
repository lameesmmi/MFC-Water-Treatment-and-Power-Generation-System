import type { Alert } from '@/app/services/api';
import { SEVERITY_CONFIG, STATUS_CONFIG, SENSOR_LABELS } from '../constants';

interface Props {
  alert:             Alert;
  onAcknowledge: (id: string) => void;
  onResolve:     (id: string) => void;
}

export function AlertCard({ alert, onAcknowledge, onResolve }: Props) {
  const sev         = SEVERITY_CONFIG[alert.severity];
  const stat        = STATUS_CONFIG[alert.status];
  const Icon        = sev.icon;
  const sensorLabel = SENSOR_LABELS[alert.sensor] ?? alert.sensor;

  return (
    <div className={`${sev.bg} rounded-lg border ${sev.border} p-3 flex items-start gap-3 ${
      alert.status === 'resolved' ? 'opacity-60' : ''
    }`}>
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
              onClick={() => onAcknowledge(alert.id)}
              className="px-2 py-1 text-[10px] rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 transition-colors font-medium"
            >
              Ack
            </button>
          )}
          <button
            onClick={() => onResolve(alert.id)}
            className="px-2 py-1 text-[10px] rounded bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 transition-colors font-medium"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}
