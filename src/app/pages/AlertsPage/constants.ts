import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { AlertSeverity, AlertStatus, AlertSensor } from '@/app/services/api';

export const LIMIT = 20;

export const SENSOR_LABELS: Record<string, string> = {
  ph:          'pH Sensor',
  tds:         'TDS Sensor',
  temperature: 'Temperature Sensor',
  flow_rate:   'Flow Rate Sensor',
  device:      'System',
};

export const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-500/10',    border: 'border-red-500/40',    text: 'text-red-600 dark:text-red-400',       icon: AlertCircle,   label: 'Critical' },
  warning:  { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-600 dark:text-orange-400', icon: AlertTriangle, label: 'Warning'  },
  info:     { bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   text: 'text-blue-600 dark:text-blue-400',     icon: Info,          label: 'Info'     },
} satisfies Record<AlertSeverity, unknown>;

export const STATUS_CONFIG = {
  active:       { text: 'text-red-500 dark:text-red-400',       label: 'Active'       },
  acknowledged: { text: 'text-orange-500 dark:text-orange-400', label: 'Acknowledged' },
  resolved:     { text: 'text-green-500 dark:text-green-400',   label: 'Resolved'     },
} satisfies Record<AlertStatus, unknown>;

export const SEVERITY_OPTIONS: { value: AlertSeverity; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning',  label: 'Warning'  },
  { value: 'info',     label: 'Info'     },
];

export const STATUS_OPTIONS: { value: AlertStatus; label: string }[] = [
  { value: 'active',       label: 'Active'       },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved',     label: 'Resolved'     },
];

export const SENSOR_OPTIONS: { value: AlertSensor; label: string }[] = [
  { value: 'ph',          label: 'pH'        },
  { value: 'tds',         label: 'TDS'       },
  { value: 'temperature', label: 'Temp'      },
  { value: 'flow_rate',   label: 'Flow Rate' },
  { value: 'device',      label: 'System'    },
];
