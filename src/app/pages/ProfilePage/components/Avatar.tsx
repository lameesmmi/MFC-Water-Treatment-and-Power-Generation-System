function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  name:  string;
  color: string;
  size?: number; // Tailwind spacing unit (e.g. 10 → 40px)
}

export function Avatar({ name, color, size = 10 }: Props) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold select-none flex-shrink-0"
      style={{ width: size * 4, height: size * 4, backgroundColor: color, fontSize: size * 1.5 }}
    >
      {initials(name)}
    </div>
  );
}
