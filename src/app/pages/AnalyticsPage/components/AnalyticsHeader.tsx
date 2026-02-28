import { format }         from 'date-fns';
import { DayPicker }      from 'react-day-picker';
import type { DateRange }  from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { BarChart2, CalendarDays, Printer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import type { AnalyticsRange } from '@/app/services/api';
import { PRESET_RANGES }   from '../constants';
import type { RangeKey }   from '../constants';

interface Props {
  range:            RangeKey;
  dateRange:        DateRange | undefined;
  popoverOpen:      boolean;
  setPopoverOpen:   (open: boolean) => void;
  onPresetClick:    (key: AnalyticsRange) => void;
  onDateSelect:     (selected: DateRange | undefined) => void;
}

export function AnalyticsHeader({
  range, dateRange, popoverOpen, setPopoverOpen, onPresetClick, onDateSelect,
}: Props) {
  return (
    <header className="print:hidden flex-shrink-0 h-12 flex items-center px-6 border-b border-border gap-3">
      <BarChart2 className="w-5 h-5 text-muted-foreground" />
      <h1 className="text-xl font-bold">Analytics &amp; Reports</h1>

      <div className="ml-auto flex items-center gap-2">
        {PRESET_RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => onPresetClick(r.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              range === r.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
            }`}
          >
            {r.label}
          </button>
        ))}

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                range === 'custom'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
              onClick={() => onPresetClick('24h' as AnalyticsRange)}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {range === 'custom' && dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
                : 'Custom'
              }
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={onDateSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              className="p-3"
            />
          </PopoverContent>
        </Popover>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors"
          title="Export as PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          Print PDF
        </button>
      </div>
    </header>
  );
}
