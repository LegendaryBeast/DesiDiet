/**
 * useUserProfile — now a thin wrapper over AuthContext.
 * Kept for backward compatibility with components that still import it.
 * New components should use `useAuth()` directly.
 */
import { useAuth } from '../contexts/AuthContext';
import { calculateNutrition, type NutritionTargets } from '../lib/calorieEngine';

// Re-export a compatible shape
export const useUserProfile = () => {
  const { profileData } = useAuth();
  const p = profileData?.profile;
  const t = profileData?.targets;

  // Build local-format profile for backward compat
  const profile = {
    nameBn: p?.name_bn || 'অতিথি',
    nameEn: p?.name_en || 'Guest',
    age: p?.age || 0,
    gender: (p?.gender as 'male' | 'female') || 'male',
    weightKg: p?.weight_kg || 0,
    heightCm: p?.height_cm || 0,
    activityLevel: (p?.activity_level as 'sedentary' | 'light' | 'moderate' | 'active') || 'moderate',
    goal: (p?.goal as 'weight_loss' | 'weight_gain' | 'maintain') || 'maintain',
    conditions: p?.medical_conditions || [],
    preferredFoods: p?.preferred_foods || [],
    dislikedFoods: p?.disliked_foods || [],
  };

  // If backend returned calculated targets, use them; otherwise calculate locally
  const targets: NutritionTargets = t
    ? {
        targetCalories: t.target_calories,
        ibwKg: t.ideal_body_weight_kg,
        bmi: t.bmi,
        bmiCategory: t.bmi_category,
        proteinG: t.protein_g,
        carbsG: t.carbs_g,
        fatG: t.fat_g,
        fiberG: t.fiber_g,
        waterL: t.water_l,
      }
    : calculateNutrition(
        profile.gender,
        profile.weightKg,
        profile.heightCm,
        profile.age,
        profile.activityLevel,
        profile.goal
      );

  return { profile, targets };
};
