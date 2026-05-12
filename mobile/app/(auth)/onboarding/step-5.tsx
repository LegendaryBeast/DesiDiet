import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { ArrowRight, Check } from 'lucide-react-native';

const CONDITIONS = [
  { value: 'diabetes', title: 'ডায়াবেটিস' },
  { value: 'hypertension', title: 'উচ্চ রক্তচাপ' },
  { value: 'heart_disease', title: 'হৃদরোগ' },
  { value: 'pcos', title: 'পিসিওএস (PCOS)' },
  { value: 'thyroid', title: 'থাইরয়েড' },
];

export default function Step5Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();

  const toggleCondition = (val: string) => {
    if (data.medical_conditions.includes(val)) {
      updateData({ medical_conditions: data.medical_conditions.filter((c) => c !== val) });
    } else {
      updateData({ medical_conditions: [...data.medical_conditions, val] });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>স্বাস্থ্য অবস্থা</Text>
        <Text style={styles.subtitle}>প্রযোজ্য ক্ষেত্রে নির্বাচন করুন (ঐচ্ছিক)</Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {CONDITIONS.map((c) => {
            const isSelected = data.medical_conditions.includes(c.value);
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.card, isSelected && styles.cardActive]}
                onPress={() => toggleCondition(c.value)}
              >
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                  {c.title}
                </Text>
                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={() => router.push('/(auth)/onboarding/step-6')}
        >
          <Text style={styles.nextBtnText}>পরবর্তী ধাপ</Text>
          <ArrowRight size={20} color={colors.white} />
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
    marginTop: spacing.md,
  },
  nextBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
});
