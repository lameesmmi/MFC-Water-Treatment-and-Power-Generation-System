function toggleValue<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

interface Props<T extends string> {
  label:    string;
  options:  { value: T; label: string }[];
  active:   T[];
  onChange: (vals: T[]) => void;
}

export function FilterGroup<T extends string>({ label, options, active, onChange }: Props<T>) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          active.length === 0
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-secondary'
        }`}
      >
        All
      </button>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(toggleValue(active, opt.value))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            active.includes(opt.value)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
