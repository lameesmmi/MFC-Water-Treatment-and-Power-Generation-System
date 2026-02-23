import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/app/components/AppLayout';
import DashboardPage from '@/app/pages/DashboardPage';
import AlertsPage from '@/app/pages/AlertsPage';
import AnalyticsPage from '@/app/pages/AnalyticsPage';
import SettingsPage from '@/app/pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
