import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { ApiClient } from '../../lib/api';
import { User } from '../../shared/types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  api: ApiClient;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const tokenKey = 'lgu-ims-online-token';
const userKey = 'lgu-ims-online-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<User | null>(() => {
    const value = localStorage.getItem(userKey);
    return value ? JSON.parse(value) : null;
  });

  const api = useMemo(() => new ApiClient(() => token), [token]);

  async function login(email: string, password: string) {
    const response = await api.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem(tokenKey, response.accessToken);
    localStorage.setItem(userKey, JSON.stringify(response.user));
    setToken(response.accessToken);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, token, api, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

