import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string, experienceLevel?: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('iotforge_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('iotforge_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('iotforge_token');
      if (storedToken) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('iotforge_user', JSON.stringify(currentUser));
        } catch {
          localStorage.removeItem('iotforge_token');
          localStorage.removeItem('iotforge_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('iotforge_token', res.accessToken);
    localStorage.setItem('iotforge_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string, experienceLevel: number = 1) => {
    const res = await api.register({ name, email, password, confirmPassword, experienceLevel });
    localStorage.setItem('iotforge_token', res.accessToken);
    localStorage.setItem('iotforge_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 2 || user?.role === 'Admin';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isAdmin,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
