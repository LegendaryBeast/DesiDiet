import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { ArrowRight } from 'lucide-react-native';

const GOALS = [
  { value: 'weight_loss', title: 'ওজন কমাতে', desc: 'অতিরিক্ত চর্বি ঝরাতে' },
  { value: 'maintain', title: 'ওজন ঠিক রাখতে', desc: 'সুস্থ থাকতে এবং ফিটনেস ধরে রাখতে' },
  { value: 'weight_gain', title: 'ওজন বাড়াতে', desc: 'স্বাস্থ্যকর উপায়ে ওজন বাড়াতে' },
];

export default function Step4Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>আপনার লক্ষ্য</Text>
        <Text style={styles.subtitle}>খাদকের মাধ্যমে আপনি কী অর্জন করতে চান?</Text>

        <View style={styles.list}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.card, data.goal === g.value && styles.cardActive]}
              onPress={() => updateData({ goal: g.value })}
            >
              <Text style={[styles.cardTitle, data.goal === g.value && styles.cardTitleActive]}>
                {g.title}
              </Text>
              <Text style={styles.cardDesc}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={() => router.push('/(auth)/onboarding/step-5')}
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
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardActive: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  cardTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.xs },
  cardTitleActive: { color: colors.primary },
  cardDesc: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary },
  nextBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  nextBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
});
