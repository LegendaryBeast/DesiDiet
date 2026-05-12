import { create } from 'zustand';

interface OnboardingState {
  data: {
    name_bn: string;
    name_en: string;
    age: string;
    gender: 'male' | 'female';
    weight_kg: string;
    height_cm: string;
    activity_level: string;
    goal: string;
    medical_conditions: string[];
    preferred_foods: string[];
    disliked_foods: string[];
  };
  updateData: (fields: Partial<OnboardingState['data']>) => void;
  reset: () => void;
}

const initialState = {
  name_bn: '',
  name_en: '',
  age: '',
  gender: 'male' as const,
  weight_kg: '',
  height_cm: '',
  activity_level: 'light',
  goal: 'maintain',
  medical_conditions: [],
  preferred_foods: [],
  disliked_foods: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: initialState,
  updateData: (fields) => set((state) => ({ data: { ...state.data, ...fields } })),
  reset: () => set({ data: initialState }),
}));
