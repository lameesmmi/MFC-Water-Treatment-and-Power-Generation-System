import type { AnalyticsRange } from '@/app/services/api';

export type RangeKey = AnalyticsRange | 'custom';

export const PRESET_RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: '24h', label: '24 Hours' },
  { key: '7d',  label: '7 Days'  },
  { key: '30d', label: '30 Days' },
];

export const SENSOR_LABELS: Record<string, string> = {
  ph:          'pH',
  tds:         'TDS',
  temperature: 'Temp',
  flow_rate:   'Flow Rate',
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  warning:  '#f97316',
  info:     '#3b82f6',
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    border:          '1px solid var(--border)',
    fontSize:        '10px',
    color:           'var(--foreground)',
  },
  labelStyle: { color: 'var(--muted-foreground)' },
};
