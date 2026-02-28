import { useState, useEffect } from 'react';
import type { DateRange }       from 'react-day-picker';
import { fetchAnalytics }       from '@/app/services/api';
import type { AnalyticsData, AnalyticsRange } from '@/app/services/api';
import type { RangeKey }        from './constants';

interface UseAnalyticsReturn {
  range:           RangeKey;
  dateRange:       DateRange | undefined;
  popoverOpen:     boolean;
  setPopoverOpen:  (open: boolean) => void;
  data:            AnalyticsData | null;
  loading:         boolean;
  error:           string | null;
  handleDateSelect:  (selected: DateRange | undefined) => void;
  handlePresetClick: (key: AnalyticsRange) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [range,       setRange]       = useState<RangeKey>('24h');
  const [dateRange,   setDateRange]   = useState<DateRange | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [data,        setData]        = useState<AnalyticsData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (range === 'custom' && !(dateRange?.from && dateRange?.to)) return;

    setLoading(true);
    setError(null);

    fetchAnalytics(
      range === 'custom' ? '24h' : range,
      range === 'custom' ? dateRange!.from : undefined,
      range === 'custom' ? dateRange!.to   : undefined,
    )
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [range, dateRange?.from, dateRange?.to]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateSelect = (selected: DateRange | undefined) => {
    setDateRange(selected);
    if (selected?.from && selected?.to) setPopoverOpen(false);
  };

  const handlePresetClick = (key: AnalyticsRange) => {
    setRange(key);
    setDateRange(undefined);
  };

  return {
    range, dateRange, popoverOpen, setPopoverOpen,
    data, loading, error,
    handleDateSelect, handlePresetClick,
  };
}
