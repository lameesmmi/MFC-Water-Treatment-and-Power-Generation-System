interface Props {
  value:    string;
  onChange: (v: string) => void;
}

export function RoleSelect({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Role</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="viewer">Viewer</option>
        <option value="operator">Operator</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}
