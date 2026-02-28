import { type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

interface Props {
  title:    string;
  height?:  string;
  children: ReactElement;
}

export function ChartCard({ title, height = 'h-64', children }: Props) {
  return (
    <div className={`bg-card rounded-lg border border-border p-3 flex flex-col ${height}`}>
      <h2 className="text-sm font-semibold mb-2 flex-shrink-0">{title}</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
