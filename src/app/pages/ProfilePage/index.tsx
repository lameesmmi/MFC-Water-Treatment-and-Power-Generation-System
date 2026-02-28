import { useAuth }         from '@/app/contexts/AuthContext';
import { OwnProfile }      from './components/OwnProfile';
import { UserManagement }  from './components/UserManagement';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8">
        <OwnProfile />
        {user.role === 'admin' && <UserManagement currentUserId={user.id} />}
      </div>
    </div>
  );
}
