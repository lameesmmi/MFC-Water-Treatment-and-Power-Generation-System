import { Routes, Route } from 'react-router-dom';
import { ProtectedLayout } from '@/app/components/ProtectedLayout';
import DashboardPage  from '@/app/pages/DashboardPage';
import AlertsPage     from '@/app/pages/AlertsPage';
import AnalyticsPage  from '@/app/pages/AnalyticsPage';
import SettingsPage   from '@/app/pages/SettingsPage';
import ProfilePage    from '@/app/pages/ProfilePage';
import LoginPage      from '@/app/pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/alerts"    element={<AlertsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings"  element={<SettingsPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
