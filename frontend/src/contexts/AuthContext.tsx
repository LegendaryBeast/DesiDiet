import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  profileApi,
  setTokens,
  clearTokens,
  getToken,
  isAuthenticated,
  type ProfileWithTargetsResponse,
  type MeResponse,
} from '../lib/api';

interface AuthUser extends MeResponse {}

interface AuthContextValue {
  user: AuthUser | null;
  profileData: ProfileWithTargetsResponse | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { phone?: string; email?: string; password: string; language?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileData, setProfileData] = useState<ProfileWithTargetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await profileApi.get();
      setProfileData(data);
    } catch {
      setProfileData(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      await refreshProfile();
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    loadUser();

    const handleLogout = () => {
      setUser(null);
      setProfileData(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [loadUser]);

  const login = async (identifier: string, password: string) => {
    const tokens = await authApi.login({ identifier, password });
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await authApi.me();
    setUser(me);
    await refreshProfile();
  };

  const register = async (data: { phone?: string; email?: string; password: string; language?: string }) => {
    const tokens = await authApi.register(data);
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await authApi.me();
    setUser(me);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setProfileData(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profileData,
      isLoading,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
