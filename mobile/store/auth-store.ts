import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  phone: string | null;
  email: string | null;
  language: string;
  name_bn?: string | null;
  name_en?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ accessToken: token }),
  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({ user: null, accessToken: null });
  },
  hydrate: async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('user'),
      ]);
      set({
        accessToken: token,
        user: userStr ? JSON.parse(userStr) : null,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));
