import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, profileApi } from '../lib/api';

interface User {
  id: string;
  phone: string | null;
  email: string | null;
  language: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (phone: string, password: string, language?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkProfile: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const res = await authApi.me();
        setUser(res.data);
        await checkProfile();
      }
    } catch {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    } finally {
      setIsLoading(false);
    }
  };

  const checkProfile = async (): Promise<boolean> => {
    try {
      await profileApi.get();
      setHasProfile(true);
      return true;
    } catch {
      setHasProfile(false);
      return false;
    }
  };

  const login = async (identifier: string, password: string) => {
    const res = await authApi.login(identifier, password);
    const { access_token, refresh_token } = res.data;
    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    const meRes = await authApi.me();
    setUser(meRes.data);
    await checkProfile();
  };

  const register = async (phone: string, password: string, language = 'bn') => {
    const res = await authApi.register(phone, password, language);
    const { access_token, refresh_token } = res.data;
    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    const meRes = await authApi.me();
    setUser(meRes.data);
    setHasProfile(false);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    setUser(null);
    setHasProfile(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasProfile,
        login,
        register,
        logout,
        checkProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
