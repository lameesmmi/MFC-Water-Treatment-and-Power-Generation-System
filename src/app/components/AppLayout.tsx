import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/app/components/Sidebar';
import { AlertSoundListener } from '@/app/components/AlertSoundListener';

export function AppLayout() {
  return (
    <div className="h-screen flex flex-row overflow-hidden bg-background text-foreground">
      <AlertSoundListener />
      <div className="print:hidden"><Sidebar /></div>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
