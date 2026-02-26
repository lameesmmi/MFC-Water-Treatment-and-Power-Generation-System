import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/app/components/Sidebar';

export function AppLayout() {
  return (
    <div className="h-screen flex flex-row overflow-hidden bg-background text-foreground">
      <div className="print:hidden"><Sidebar /></div>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
