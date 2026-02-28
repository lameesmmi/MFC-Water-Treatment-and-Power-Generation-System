import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AlertSeverity, AlertStatus, AlertSensor } from '@/app/services/api';
import {
  SEVERITY_OPTIONS, STATUS_OPTIONS, SENSOR_OPTIONS,
} from '../constants';
import { FilterGroup } from './FilterGroup';

interface Pagination {
  pages: number;
  total: number;
}

interface Props {
  severityFilter: AlertSeverity[];
  statusFilter:   AlertStatus[];
  sensorFilter:   AlertSensor[];
  changeSeverity: (v: AlertSeverity[]) => void;
  changeStatus:   (v: AlertStatus[])   => void;
  changeSensor:   (v: AlertSensor[])   => void;
  page:           number;
  setPage:        (p: number) => void;
  pagination:     Pagination;
}

export function FilterBar({
  severityFilter, statusFilter, sensorFilter,
  changeSeverity, changeStatus, changeSensor,
  page, setPage, pagination,
}: Props) {
  return (
    <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-2.5 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters</span>
      </div>

      <FilterGroup label="Severity" options={SEVERITY_OPTIONS} active={severityFilter} onChange={changeSeverity} />
      <FilterGroup label="Status"   options={STATUS_OPTIONS}   active={statusFilter}   onChange={changeStatus}   />
      <FilterGroup label="Sensor"   options={SENSOR_OPTIONS}   active={sensorFilter}   onChange={changeSensor}   />

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-1 border-t border-border mt-0.5">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <span className="text-xs text-muted-foreground">
            Page {page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total} result{pagination.total !== 1 ? 's' : ''}
          </span>

          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
