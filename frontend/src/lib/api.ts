/**
 * DesiDiet API Client
 * Connects to the FastAPI backend running on http://localhost:8000
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

// ─── Token Management ─────────────────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem('desidiet_access_token');
export const getRefreshToken = (): string | null => localStorage.getItem('desidiet_refresh_token');

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('desidiet_access_token', access);
  localStorage.setItem('desidiet_refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('desidiet_access_token');
  localStorage.removeItem('desidiet_refresh_token');
};

export const isAuthenticated = (): boolean => !!getToken();

// ─── Base Fetch Helper ─────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && !retried) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const tokens = await refreshRes.json();
          setTokens(tokens.access_token, tokens.refresh_token);
          return apiFetch<T>(path, options, true);
        }
      } catch {
        // refresh failed
      }
    }
    clearTokens();
    window.dispatchEvent(new Event('auth:logout'));
    throw new ApiError(401, 'Unauthorized');
  }

  if (!res.ok) {
    let detail = 'An error occurred';
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }

  // Some endpoints return 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MeResponse {
  id: string;
  phone: string | null;
  email: string | null;
  language: string;
  createdAt: string;
}

export const authApi = {
  register: (data: { phone?: string; email?: string; password: string; language?: string }) =>
    apiFetch<TokenResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { identifier: string; password: string }) =>
    apiFetch<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: (refresh_token: string) =>
    apiFetch<TokenResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),

  me: () => apiFetch<MeResponse>('/auth/me'),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileResponse {
  user_id: string;
  name_bn: string | null;
  name_en: string | null;
  age: number | null;
  gender: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: string | null;
  goal: string | null;
  medical_conditions: string[] | null;
  preferred_foods: string[] | null;
  disliked_foods: string[] | null;
  updated_at: string;
}

export interface NutritionTargetsResponse {
  bmi: number;
  bmi_category: string;
  ideal_body_weight_kg: number;
  target_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_l: number;
}

export interface ProfileWithTargetsResponse {
  profile: ProfileResponse;
  targets: NutritionTargetsResponse;
}

export const profileApi = {
  get: () => apiFetch<ProfileWithTargetsResponse>('/profile'),

  create: (data: Partial<{
    name_bn: string; name_en: string; age: number; gender: string;
    weight_kg: number; height_cm: number; activity_level: string; goal: string;
    medical_conditions: string[]; preferred_foods: string[]; disliked_foods: string[];
  }>) => apiFetch<ProfileResponse>('/profile', { method: 'POST', body: JSON.stringify(data) }),

  update: (data: Partial<{
    name_bn: string; name_en: string; age: number; gender: string;
    weight_kg: number; height_cm: number; activity_level: string; goal: string;
    medical_conditions: string[]; preferred_foods: string[]; disliked_foods: string[];
  }>) => apiFetch<ProfileResponse>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Health Log ───────────────────────────────────────────────────────────────

export interface HealthLogResponse {
  log_id: string;
  user_id: string;
  log_date: string;
  weight_kg: number | null;
  blood_pressure: string | null;
  blood_sugar: number | null;
  hba1c: number | null;
  notes: string | null;
  symptoms: string[] | null;
  created_at: string;
}

export interface HealthTrendsResponse {
  weight_trend: {
    data_points: number;
    latest_kg: number | null;
    change_kg: number | null;
    history: [string, number][];
  };
  blood_sugar_trend: {
    data_points: number;
    history: [string, number][];
  };
}

export const healthLogApi = {
  create: (data: {
    log_date?: string; weight_kg?: number; blood_pressure?: string;
    blood_sugar?: number; hba1c?: number; notes?: string; symptoms?: string[];
  }) => apiFetch<HealthLogResponse>('/health-logs', { method: 'POST', body: JSON.stringify(data) }),

  list: (limit = 30) => apiFetch<HealthLogResponse[]>(`/health-logs?limit=${limit}`),

  trends: () => apiFetch<HealthTrendsResponse>('/health-logs/trends'),
};

// ─── Meal Plan ────────────────────────────────────────────────────────────────

export interface MealPlanResponse {
  plan_id: string;
  user_id: string;
  plan_date: string;
  plan_type: string;
  plan_data: Record<string, unknown>;
  calorie_target: number;
  ai_suggestion_cal: number | null;
  user_choice_cal: number | null;
  language: string;
  feedback: number | null;
  completed_slots: string[];
  created_at: string;
}

export interface MarkSlotCompleteResponse {
  plan_id: string;
  completed_slots: string[];
  message: string;
}

export const mealPlanApi = {
  getDaily: (language = 'bn') =>
    apiFetch<MealPlanResponse>(`/meal-plans/daily?language=${language}`),

  getWeekly: (language = 'bn') =>
    apiFetch<MealPlanResponse[]>(`/meal-plans/weekly?language=${language}`),

  getHistory: (limit = 30) =>
    apiFetch<MealPlanResponse[]>(`/meal-plans/history?limit=${limit}`),

  submitFeedback: (planId: string, feedback: number) =>
    apiFetch<{ message: string; feedback: number }>(`/meal-plans/${planId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }),

  markSlotComplete: (planId: string, slot: string, completed = true) =>
    apiFetch<MarkSlotCompleteResponse>(`/meal-plans/${planId}/mark-complete`, {
      method: 'PATCH',
      body: JSON.stringify({ slot, completed }),
    }),

  editPlan: (planId: string, plan_data: any, user_choice_cal: number) =>
    apiFetch<MealPlanResponse>(`/meal-plans/${planId}/edit`, {
      method: 'PATCH',
      body: JSON.stringify({ plan_data, user_choice_cal }),
    }),
};

// ─── Chat (SSE Streaming) ─────────────────────────────────────────────────────

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export const chatApi = {
  /**
   * Stream chat response via SSE.
   * onToken: called for each streaming token
   * onDone: called when stream ends
   * onError: called on error
   */
  stream: (
    message: string,
    language: string,
    history: ChatHistoryItem[],
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: string) => void
  ): (() => void) => {
    const token = getToken();
    const ctrl = new AbortController();

    fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, language, history }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          onError('Failed to connect to AI');
          return;
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) onToken(data.token);
                if (data.done) onDone();
                if (data.error) onError(data.error);
              } catch { /* ignore parse errors */ }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err.message);
      });

    return () => ctrl.abort();
  },

  /**
   * Stream diet plan session SSE.
   */
  dietPlanStream: (
    message: string,
    language: string,
    history: ChatHistoryItem[],
    collected: Record<string, unknown>,
    onToken: (token: string) => void,
    onDone: () => void,
    onPlanReady: (plan: Record<string, unknown>) => void,
    onError: (err: string) => void
  ): (() => void) => {
    const token = getToken();
    const ctrl = new AbortController();

    fetch(`${BASE_URL}/chat/diet-plan-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, language, history, collected }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          onError('Failed to connect to AI');
          return;
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) onToken(data.token);
                if (data.done) onDone();
                if (data.plan_ready) onPlanReady(data.plan_ready);
                if (data.error) onError(data.error);
              } catch { /* ignore */ }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err.message);
      });

    return () => ctrl.abort();
  },
};

// ─── Foods ────────────────────────────────────────────────────────────────────

export interface FoodSearchResponse {
  code: string;
  name_en: string;
  name_bn: string;
  calories: number | null;
  protein: number | null;
  food_group: string;
}

export interface SafeFoodsResponse {
  code: string;
  name_en: string;
  name_bn: string;
  calories: number | null;
  protein: number | null;
  fiber: number | null;
  food_group: string;
  preference_score: number;
}

export interface FoodDetailResponse {
  code: string;
  name_en: string;
  name_bn: string;
  food_group: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  rules: { action: string; condition: string; reason: string }[];
}

export interface FoodWithInsightResponse {
  code: string;
  name_en: string;
  name_bn: string;
  calories: number | null;
  protein: number | null;
  fiber: number | null;
  fat: number | null;
  carbs: number | null;
  food_group: string;
  safety: 'safe' | 'caution' | 'avoid';
  ai_insight: string;
}

export const foodsApi = {
  search: (q: string) =>
    apiFetch<FoodSearchResponse[]>(`/foods/search?q=${encodeURIComponent(q)}`),

  safeFoods: () => apiFetch<SafeFoodsResponse[]>('/foods/safe-foods'),

  detail: (code: string) =>
    apiFetch<FoodDetailResponse>(`/foods/${encodeURIComponent(code)}`),

  searchWithInsight: (q: string, slot = 'any') =>
    apiFetch<FoodWithInsightResponse[]>(
      `/foods/search-with-insight?q=${encodeURIComponent(q)}&slot=${slot}`
    ),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface NutritionReport {
  user_id: string;
  targets: NutritionTargetsResponse;
  latest_health_log: {
    weight_kg: number | null;
    blood_sugar: number | null;
    blood_pressure: string | null;
  };
  applicable_rules: { condition: string; food: string; action: string; reason: string }[];
}

export interface ConditionsReport {
  conditions: string[];
  rules: { condition: string; food: string; action: string; reason: string }[];
}

export const reportsApi = {
  nutrition: () => apiFetch<NutritionReport>('/reports/nutrition'),

  conditions: () => apiFetch<ConditionsReport>('/reports/conditions'),

  sendEmail: (email: string, language = 'en') =>
    apiFetch<{ message: string; email: string; report_summary: string }>('/reports/send-email', {
      method: 'POST',
      body: JSON.stringify({ email, language }),
    }),
};

// ─── Meal Tracking ────────────────────────────────────────────────────────────

export interface ParsedFoodItem {
  name: string;
  amount_g: number | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealTrackingResponse {
  id: string;
  parsed_items: ParsedFoodItem[];
  total_calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  ai_feedback: string;
  meal_slot: string | null;
  logged_at: string;
}

export interface MealTrackingListItem {
  id: string;
  input_text: string;
  total_calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  meal_slot: string | null;
  logged_at: string;
}

export const mealTrackingApi = {
  log: (data: { input: string; meal_slot?: string; language?: string }) =>
    apiFetch<MealTrackingResponse>('/meal-tracking', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  today: () => apiFetch<MealTrackingListItem[]>('/meal-tracking/today'),
};

// ─── Medicine Reminders ───────────────────────────────────────────────────────

export interface MedicineItem {
  name: string;
  dose: string;
  times: string[];
  with_food: boolean;
  notes: string | null;
}

export interface MedicineReminderResponse {
  id: string;
  medicines: MedicineItem[];
  confirmation: string;
}

export interface MedicineReminderListItem {
  id: string;
  name: string;
  dose: string;
  times: string[];
  with_food: boolean;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export const medicineApi = {
  add: (data: { input: string; language?: string }) =>
    apiFetch<MedicineReminderResponse>('/medicine-reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => apiFetch<MedicineReminderListItem[]>('/medicine-reminders'),

  delete: (id: string) =>
    apiFetch<{ message: string; id: string }>(`/medicine-reminders/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Meal Builder ─────────────────────────────────────────────────────────────

export interface MealBuilderItem {
  food_code: string;
  amount_g: number;
  name_en?: string;
  name_bn?: string;
}

export interface MealBuilderAnalyzeResponse {
  total_calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  vs_plan_target: {
    slot_target_kcal: number | null;
    difference?: number;
    within_range?: boolean;
    note?: string;
  };
  condition_safety: {
    safe: boolean;
    flags: string[];
    note?: string;
  };
  ai_insight: string;
  comparison: {
    before: Record<string, number>;
    after: Record<string, number>;
    verdict: string;
  } | null;
  meal_score: {
    balance?: number;
    protein_adequacy?: number;
    condition_safety?: number;
    overall: number;
    label: string;
  };
}

export const mealBuilderApi = {
  analyze: (data: {
    meal_slot?: string;
    items: MealBuilderItem[];
    replaced_item?: MealBuilderItem;
    language?: string;
  }) =>
    apiFetch<MealBuilderAnalyzeResponse>('/meal-builder/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
