import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getCurrentUser, login, register } from '../api/auth.api';
import { setAuthToken } from '../api/client';
import { AuthContext, type AuthContextValue } from './auth-context';
import type { User } from '../types/auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    };

    window.addEventListener('local-shoppyy:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('local-shoppyy:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null && token !== null,
    isLoading,
    login: async (input) => {
      setIsLoading(true);
      try {
        const result = await login(input);
        setAuthToken(result.accessToken);
        setToken(result.accessToken);
        setUser(result.user);
      } finally {
        setIsLoading(false);
      }
    },
    register: async (input) => {
      setIsLoading(true);
      try {
        await register(input);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    logout: () => {
      setToken(null);
      setAuthToken(null);
      setUser(null);
    },
  }), [isLoading, token, user]);

  useEffect(() => {
    if (!token) return;
    void getCurrentUser(token).then(setUser).catch(() => {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    });
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

