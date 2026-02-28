interface Props {
  label:        string;
  type?:        string;
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  required?:    boolean;
  autoComplete?: string;
}

export function Field({ label, type = 'text', value, onChange, placeholder, required, autoComplete }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
