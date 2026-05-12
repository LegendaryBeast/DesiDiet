import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { profileApi } from '../../../lib/api';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { ArrowRight, Check } from 'lucide-react-native';

const PREFERENCES = [
  { value: 'vegetarian', title: 'নিরামিষভোজী' },
  { value: 'vegan', title: 'ভেগান' },
  { value: 'gluten_free', title: 'গ্লুটেন ফ্রি' },
  { value: 'dairy_free', title: 'ডেইরি ফ্রি' },
  { value: 'nut_allergy', title: 'বাদামে এলার্জি' },
];

export default function Step6Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const togglePref = (val: string) => {
    if (data.preferred_foods.includes(val)) {
      updateData({ preferred_foods: data.preferred_foods.filter((c) => c !== val) });
    } else {
      updateData({ preferred_foods: [...data.preferred_foods, val] });
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create profile via API
      await profileApi.create({
        name_bn: data.name_bn,
        name_en: data.name_en,
        age: parseInt(data.age),
        gender: data.gender,
        weight_kg: parseFloat(data.weight_kg),
        height_cm: parseFloat(data.height_cm),
        activity_level: data.activity_level,
        goal: data.goal,
        medical_conditions: data.medical_conditions,
        preferred_foods: data.preferred_foods,
      });
      // Move to summary
      router.push('/(auth)/onboarding/step-7');
    } catch (e) {
      console.error('Profile creation failed:', e);
      // In a real app we'd show an error toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>খাদ্যাভ্যাস</Text>
        <Text style={styles.subtitle}>যেকোনো পছন্দ বা এলার্জি (ঐচ্ছিক)</Text>

        <View style={styles.list}>
          {PREFERENCES.map((c) => {
            const isSelected = data.preferred_foods.includes(c.value);
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.card, isSelected && styles.cardActive]}
                onPress={() => togglePref(c.value)}
              >
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                  {c.title}
                </Text>
                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]} 
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.nextBtnText}>প্রোফাইল তৈরি করুন</Text>
              <ArrowRight size={20} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.bnBold, fontSize: 32, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xl },
  list: { flex: 1 },
  card: {
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardActive: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  cardTitle: { fontFamily: fonts.bn, fontSize: 18, color: colors.textPrimary },
  cardTitleActive: { fontFamily: fonts.bnBold, color: colors.primary },
  nextBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  nextBtnDisabled: { opacity: 0.7 },
  nextBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
});
