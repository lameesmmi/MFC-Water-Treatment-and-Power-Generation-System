import type { LucideIcon } from 'lucide-react';

interface Props {
  label:  string;
  value:  string;
  unit:   string;
  icon:   LucideIcon;
  color:  string;
  bg:     string;
  border: string;
}

export function KpiCard({ label, value, unit, icon: Icon, color, bg, border }: Props) {
  return (
    <div className={`${bg} rounded-lg border ${border} p-3 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
