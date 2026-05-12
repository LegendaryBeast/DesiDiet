import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  language: 'en' | 'bn';
  notificationsEnabled: boolean;
  mealTimes: {
    breakfast: string; // HH:mm
    lunch: string;
    snack: string;
    dinner: string;
  };
  setLanguage: (lang: 'en' | 'bn') => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setMealTime: (slot: 'breakfast' | 'lunch' | 'snack' | 'dinner', time: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  notificationsEnabled: false,
  mealTimes: {
    breakfast: '08:00',
    lunch: '13:00',
    snack: '16:00',
    dinner: '20:00',
  },
  setLanguage: async (lang) => {
    await AsyncStorage.setItem('app_language', lang);
    set({ language: lang });
  },
  setNotificationsEnabled: async (enabled) => {
    await AsyncStorage.setItem('notifications_enabled', String(enabled));
    set({ notificationsEnabled: enabled });
  },
  setMealTime: async (slot, time) => {
    const newTimes = { ...get().mealTimes, [slot]: time };
    await AsyncStorage.setItem('meal_times', JSON.stringify(newTimes));
    set({ mealTimes: newTimes });
  },
  hydrate: async () => {
    try {
      const [lang, notifs, timesStr] = await Promise.all([
        AsyncStorage.getItem('app_language'),
        AsyncStorage.getItem('notifications_enabled'),
        AsyncStorage.getItem('meal_times'),
      ]);
      set((state) => ({
        language: (lang as 'en' | 'bn') || state.language,
        notificationsEnabled: notifs === 'true',
        mealTimes: timesStr ? JSON.parse(timesStr) : state.mealTimes,
      }));
    } catch (e) {
      console.error('Failed to hydrate settings', e);
    }
  },
}));
