import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { ArrowRight } from 'lucide-react-native';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', title: 'কম (ডেস্ক জব)', desc: 'সারাদিন বসে কাজ, ব্যায়াম করা হয় না' },
  { value: 'light', title: 'হালকা (হাঁটাচলা)', desc: 'হালকা কাজ, সপ্তাহে ১-২ দিন ব্যায়াম' },
  { value: 'moderate', title: 'মাঝারি (পরিশ্রমী)', desc: 'সক্রিয় কাজ, সপ্তাহে ৩-৪ দিন ব্যায়াম' },
  { value: 'active', title: 'বেশি (কঠোর পরিশ্রম)', desc: 'শারীরিক পরিশ্রম, প্রতিদিন ব্যায়াম' },
];

export default function Step3Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>কর্ম তৎপরতা</Text>
        <Text style={styles.subtitle}>আপনার সাধারণ দিনের বর্ণনা দিন</Text>

        <View style={styles.list}>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.card, data.activity_level === level.value && styles.cardActive]}
              onPress={() => updateData({ activity_level: level.value })}
            >
              <Text style={[styles.cardTitle, data.activity_level === level.value && styles.cardTitleActive]}>
                {level.title}
              </Text>
              <Text style={styles.cardDesc}>{level.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={() => router.push('/(auth)/onboarding/step-4')}
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
