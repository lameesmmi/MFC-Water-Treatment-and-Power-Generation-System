import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser } from '@/app/services/api';
import { resetSocket } from '@/app/services/socket';

export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      'admin' | 'operator' | 'viewer';
  color:     string;
  createdAt: string;
}

interface AuthState {
  user:       User | null;
  token:      string | null;
  loading:    boolean;
  login:      (token: string, user: User) => void;
  logout:     () => void;
  updateUser: (user: User) => void;
}

const TOKEN_KEY = 'mfc_token';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    getCurrentUser()
      .then(u => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(newToken: string, newUser: User) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    resetSocket();
  }

  function updateUser(updated: User) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
