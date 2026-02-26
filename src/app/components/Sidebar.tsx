import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bell, BarChart2, Settings, Menu, ChevronLeft, UserCircle, LogOut, Home } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useAuth } from '@/app/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Bell,            label: 'Alerts',    to: '/alerts'    },
  { icon: BarChart2,       label: 'Analytics', to: '/analytics' },
  { icon: Settings,        label: 'Settings',  to: '/settings'  },
  { icon: UserCircle,      label: 'Profile',   to: '/profile'   },
];

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      className={`flex flex-col flex-shrink-0 h-full border-r border-border bg-card text-card-foreground transition-all duration-300 overflow-hidden ${
        expanded ? 'w-48' : 'w-14'
      }`}
    >
      {/* Toggle button */}
      <div className="flex-shrink-0 h-12 flex items-center px-3 border-b border-border">
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {expanded && (
          <span className="ml-2 font-bold text-sm truncate">MFC System</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1 py-2 px-1.5">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors border-r-2 ${
                isActive
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {expanded && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="my-1 mx-2 border-t border-border" />

        {/* Home / Landing page */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors border-r-2 ${
              isActive
                ? 'bg-primary/10 text-primary border-primary'
                : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`
          }
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {expanded && <span className="truncate">Home</span>}
        </NavLink>
      </nav>

      {/* User section + logout */}
      {user && (
        <div className="flex-shrink-0 border-t border-border px-1.5 py-2 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-white text-xs font-semibold"
              style={{ width: 28, height: 28, backgroundColor: user.color }}
            >
              {initials(user.name)}
            </div>
            {expanded && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {expanded && <span className="truncate">Logout</span>}
          </button>
        </div>
      )}

      {/* Theme toggle pinned to bottom */}
      <div className="flex-shrink-0 flex items-center justify-center py-3 border-t border-border">
        <ThemeToggle />
      </div>
    </aside>
  );
}
