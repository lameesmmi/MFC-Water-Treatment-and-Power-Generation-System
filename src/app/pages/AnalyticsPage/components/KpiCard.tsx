interface Props {
  label: string;
  value: string;
  unit:  string;
}

export function KpiCard({ label, value, unit }: Props) {
  return (
    <div className="bg-card rounded-lg border border-border p-3 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
