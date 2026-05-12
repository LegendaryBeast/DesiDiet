import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../../lib/api';
import { colors, fonts, spacing, radius } from '../../../lib/theme';
import { CheckCircle } from 'lucide-react-native';

export default function Step7Screen() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['nutrition_report'],
    queryFn: async () => {
      const res = await reportsApi.nutrition();
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>এআই আপনার ডেটা বিশ্লেষণ করছে...</Text>
      </View>
    );
  }

  if (error || !data || data.error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>ডেটা লোড করতে সমস্যা হয়েছে</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnText}>হোমে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const targets = data.targets;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <CheckCircle size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>প্রোফাইল তৈরি হয়েছে!</Text>
      <Text style={styles.subtitle}>এআই আপনার জন্য ডায়েট প্ল্যান প্রস্তুত করেছে</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>দৈনিক লক্ষ্যমাত্রা</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{targets.target_calories}</Text>
            <Text style={styles.statLabel}>ক্যালরি</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{targets.protein_g}g</Text>
            <Text style={styles.statLabel}>প্রোটিন</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{targets.carbs_g}g</Text>
            <Text style={styles.statLabel}>শর্করা</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{targets.fat_g}g</Text>
            <Text style={styles.statLabel}>ফ্যাট</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>বডি মাস ইনডেক্স (BMI)</Text>
        <Text style={styles.bmiValue}>{targets.bmi.toFixed(1)}</Text>
        <Text style={styles.bmiLabel}>{targets.bmi_category}</Text>
        <Text style={styles.bmiHint}>
          আপনার আদর্শ ওজন হওয়া উচিত {Math.round(targets.ideal_body_weight_kg)} কেজি। 
          আমরা আপনার লক্ষ্য অনুযায়ী প্রতিদিনের প্ল্যান সাজাব।
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.btnText}>শুরু করুন</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: 20 },
  iconContainer: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontFamily: fonts.bnBold, fontSize: 32, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  loadingText: { fontFamily: fonts.bn, fontSize: 18, color: colors.textPrimary, marginTop: spacing.lg },
  errorText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.error, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statBox: {
    flex: 1, minWidth: '40%', backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.primary, marginBottom: spacing.xs },
  statLabel: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary },
  bmiValue: { fontFamily: fonts.display, fontSize: 48, color: colors.accent, textAlign: 'center' },
  bmiLabel: { fontFamily: fonts.bnBold, fontSize: 20, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  bmiHint: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill,
    alignItems: 'center', marginTop: spacing.md,
  },
  btnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
});
