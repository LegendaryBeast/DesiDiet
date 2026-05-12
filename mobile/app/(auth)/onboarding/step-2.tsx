import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { ArrowRight } from 'lucide-react-native';

export default function Step2Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();

  const handleNext = () => {
    if (data.weight_kg && data.height_cm) {
      router.push('/(auth)/onboarding/step-3');
    }
  };

  const isComplete = data.weight_kg.length > 0 && data.height_cm.length > 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>শারীরিক গঠন</Text>
        <Text style={styles.subtitle}>সঠিক ক্যালরি হিসাবের জন্য এটি প্রয়োজন</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ওজন (কেজি)</Text>
            <TextInput
              style={styles.input}
              value={data.weight_kg}
              onChangeText={(text) => updateData({ weight_kg: text.replace(/[^0-9.]/g, '') })}
              placeholder="যেমন: ৬৫"
              keyboardType="decimal-pad"
              maxLength={5}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>উচ্চতা (সেন্টিমিটার)</Text>
            <TextInput
              style={styles.input}
              value={data.height_cm}
              onChangeText={(text) => updateData({ height_cm: text.replace(/[^0-9.]/g, '') })}
              placeholder="যেমন: ১৬৫"
              keyboardType="decimal-pad"
              maxLength={5}
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>১ ফুট = ৩০.৪৮ সেন্টিমিটার (যেমন ৫ ফুট ৫ ইঞ্চি = ১৬৫ সেমি)</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={[styles.nextBtn, !isComplete && styles.nextBtnDisabled]} 
          onPress={handleNext}
          disabled={!isComplete}
        >
          <Text style={styles.nextBtnText}>পরবর্তী ধাপ</Text>
          <ArrowRight size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.bnBold, fontSize: 32, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xl },
  form: { gap: spacing.lg },
  inputGroup: { gap: spacing.xs },
  label: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.textPrimary },
  hint: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    fontFamily: fonts.body, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border
  },
  nextBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
});
