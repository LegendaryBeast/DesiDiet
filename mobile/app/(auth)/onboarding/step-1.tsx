import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { ArrowRight } from 'lucide-react-native';

export default function Step1Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();

  const handleNext = () => {
    if (data.name_bn.trim() && data.age) {
      updateData({ name_en: data.name_bn }); // Simplified for now
      router.push('/(auth)/onboarding/step-2');
    }
  };

  const isComplete = data.name_bn.trim().length > 0 && data.age.length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>আপনার পরিচয়</Text>
        <Text style={styles.subtitle}>আপনাকে কীভাবে ডাকব?</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>নাম (বাংলায় বা ইংরেজিতে)</Text>
            <TextInput
              style={styles.input}
              value={data.name_bn}
              onChangeText={(text) => updateData({ name_bn: text })}
              placeholder="যেমন: রহিম"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>বয়স</Text>
            <TextInput
              style={styles.input}
              value={data.age}
              onChangeText={(text) => updateData({ age: text.replace(/[^0-9]/g, '') })}
              placeholder="২৫"
              keyboardType="number-pad"
              maxLength={3}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>লিঙ্গ</Text>
            <View style={styles.row}>
              {(['male', 'female'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.btnOutline, data.gender === g && styles.btnOutlineActive]}
                  onPress={() => updateData({ gender: g })}
                >
                  <Text style={[styles.btnOutlineText, data.gender === g && styles.btnOutlineTextActive]}>
                    {g === 'male' ? 'পুরুষ' : 'নারী'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    fontFamily: fonts.body, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  btnOutline: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  btnOutlineActive: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  btnOutlineText: { fontFamily: fonts.bn, fontSize: 16, color: colors.textPrimary },
  btnOutlineTextActive: { fontFamily: fonts.bnBold, color: colors.primary },
  nextBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
});
