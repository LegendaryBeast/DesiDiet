import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = res.data;
          await AsyncStorage.setItem('access_token', access_token);
          await AsyncStorage.setItem('refresh_token', refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (phone: string, password: string, language = 'bn') =>
    api.post('/auth/register', { phone, password, language }),
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  me: () => api.get('/auth/me'),
};

// Profile API
export const profileApi = {
  create: (data: any) => api.post('/profile', data),
  update: (data: any) => api.patch('/profile', data),
  get: () => api.get('/profile'),
};

// Health Log API
export const healthLogApi = {
  create: (data: any) => api.post('/health-logs', data),
  list: () => api.get('/health-logs'),
  trends: () => api.get('/health-logs/trends'),
};

// Meal Plan API
export const mealPlanApi = {
  daily: (language = 'bn') => api.get(`/meal-plans/daily?language=${language}`),
  weekly: (language = 'bn') => api.get(`/meal-plans/weekly?language=${language}`),
  history: () => api.get('/meal-plans/history'),
  feedback: (planId: string, score: number) =>
    api.post(`/meal-plans/${planId}/feedback`, { feedback: score }),
  markComplete: (planId: string, slot: string, completed: boolean) =>
    api.patch(`/meal-plans/${planId}/mark-complete`, { slot, completed }),
};

// Foods API
export const foodsApi = {
  search: (q: string) => api.get(`/foods/search?q=${q}`),
  searchWithInsight: (q: string, slot = 'any') => api.get(`/foods/search-with-insight?q=${q}&slot=${slot}`),
  safeFoods: () => api.get('/foods/safe-foods'),
  detail: (code: string) => api.get(`/foods/${code}`),
};

// Reports API
export const reportsApi = {
  nutrition: () => api.get('/reports/nutrition'),
  conditions: () => api.get('/reports/conditions'),
  sendEmail: (email: string, language = 'en') => api.post('/reports/send-email', { email, language }),
};

// Chat API — returns SSE stream URL
export const chatApi = {
  streamUrl: `${API_BASE_URL}/chat`,
};

// Diet Plan Chat API
export const dietPlanChatApi = {
  streamUrl: `${API_BASE_URL}/chat/diet-plan-session`,
};

// Meal Tracking API
export const mealTrackingApi = {
  log: (input: string, mealSlot?: string, language = 'en') => 
    api.post('/meal-tracking', { input, meal_slot: mealSlot, language }),
  today: () => api.get('/meal-tracking/today'),
};

// Meal Builder API
export const mealBuilderApi = {
  analyze: (data: any) => api.post('/meal-builder/analyze', data),
};

// Medicine API
export const medicineApi = {
  add: (input: string, language = 'en') => api.post('/medicine-reminders', { input, language }),
  list: () => api.get('/medicine-reminders'),
  delete: (id: string) => api.delete(`/medicine-reminders/${id}`),
};
