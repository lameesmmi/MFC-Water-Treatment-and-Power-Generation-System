import { format }       from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { RangeKey }  from './constants';

export function formatMs(ms: number | null): string {
  if (ms === null)       return '—';
  if (ms < 60_000)       return `${Math.round(ms / 1_000)}s`;
  if (ms < 3_600_000)    return `${Math.round(ms / 60_000)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

export function rangeLabel(range: RangeKey, dr: DateRange | undefined): string {
  if (range === '24h') return 'Last 24 Hours';
  if (range === '7d')  return 'Last 7 Days';
  if (range === '30d') return 'Last 30 Days';
  if (dr?.from && dr?.to)
    return `${format(dr.from, 'MMM d, yyyy')} – ${format(dr.to, 'MMM d, yyyy')}`;
  return 'Custom Range';
}
