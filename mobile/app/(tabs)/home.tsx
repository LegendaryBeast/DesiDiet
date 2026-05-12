import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, mealPlanApi, mealTrackingApi, medicineApi, profileApi } from '../../lib/api';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { Flame, Pill, Activity, Plus, CheckCircle2 } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { HomeScreenSkeleton } from '../../components/SkeletonLoader';
import { useHaptics } from '../../hooks/useHaptics';

const { width } = Dimensions.get('window');

// Simple progress ring using standard SVG
const CircularProgress = ({ value, max, color, size = 160, strokeWidth = 15 }: { value: number; max: number; color: string; size?: number; strokeWidth?: number }) => {
  const r = (size - strokeWidth) / 2;        // avoid shadowing `radius` token
  const circumference = r * 2 * Math.PI;
  const percentage = Math.min(value / (max || 1), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle stroke={colors.surfaceLight} cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} fill="none" />
        <Circle
          stroke={color} cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" fill="none"
          originX={size / 2} originY={size / 2} rotation="-90"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.ringValue}>{value}</Text>
        <Text style={styles.ringLabel}>/ {max} kcal</Text>
      </View>
    </View>
  );
};

// Returns time-appropriate Bengali greeting
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'শুভ সকাল';   // 5am–noon
  if (h >= 12 && h < 17) return 'শুভ দুপুর';  // noon–5pm
  if (h >= 17 && h < 21) return 'শুভ বিকেল';  // 5pm–9pm
  return 'শুভ রাত';                             // 9pm–5am
}

export default function HomeScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [refreshing, setRefreshing] = useState(false);

  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await profileApi.get()).data,
    staleTime: 1000 * 60 * 10, // 10 min — names don't change often
  });

  const { data: reportData, refetch: refetchReport } = useQuery({
    queryKey: ['nutrition_report'],
    queryFn: async () => (await reportsApi.nutrition()).data,
  });

  const { data: planData, refetch: refetchPlan } = useQuery({
    queryKey: ['daily_plan'],
    queryFn: async () => (await mealPlanApi.daily('bn')).data,
  });

  const { data: trackingData, refetch: refetchTracking } = useQuery({
    queryKey: ['daily_tracking'],
    queryFn: async () => (await mealTrackingApi.today()).data,
  });

  const { data: medicineData, refetch: refetchMedicine } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => (await medicineApi.list()).data,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchReport(), refetchPlan(), refetchTracking(), refetchMedicine(), refetchProfile()]);
    setRefreshing(false);
  }, []);

  // Calculate Consumed Calories & Macros
  let consumedCals = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFat = 0;

  // Add unplanned tracked meals
  if (trackingData) {
    trackingData.forEach((log: any) => {
      consumedCals += log.total_calories || 0;
      consumedProtein += log.macros?.protein_g || 0;
      consumedCarbs += log.macros?.carbs_g || 0;
      consumedFat += log.macros?.fat_g || 0;
    });
  }

  // Add planned completed meals
  const plannedMeals = planData?.plan_data?.meals || [];
  const completedSlots = (planData?.completed_slots && typeof planData.completed_slots === 'string' 
    ? JSON.parse(planData.completed_slots) 
    : planData?.completed_slots) || [];
    
  plannedMeals.forEach((meal: any) => {
    if (completedSlots.includes(meal.slot)) {
      consumedCals += meal.target_calories || 0;
      // Rough estimation of macros for planned items if not explicitly available
      consumedProtein += (meal.target_calories * 0.2) / 4;
      consumedCarbs += (meal.target_calories * 0.5) / 4;
      consumedFat += (meal.target_calories * 0.3) / 9;
    }
  });

  const targetCals = reportData?.targets?.target_calories || 2000;
  const targetProtein = reportData?.targets?.protein_g || 100;
  const targetCarbs = reportData?.targets?.carbs_g || 250;
  const targetFat = reportData?.targets?.fat_g || 65;

  const isLoading = !reportData && !planData && !trackingData;
  if (isLoading) return <HomeScreenSkeleton />;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {profileData?.profile?.name_bn || profileData?.profile?.name_en || 'বন্ধু'} 👋
        </Text>
        <Text style={styles.subGreeting}>আপনার আজকের সারসংক্ষেপ</Text>
      </View>

      {/* Plan CTA */}
      <TouchableOpacity 
        style={styles.planCtaCard}
        onPress={() => { haptics.light(); router.push('/(tabs)/diet-plan'); }}
        activeOpacity={0.8}
      >
        <View style={styles.planCtaIcon}>
          <Sparkles size={24} color={colors.white} />
        </View>
        <View style={styles.planCtaText}>
          <Text style={styles.planCtaTitle}>
            {planData ? 'পরিকল্পনা আপডেট করুন' : 'ডায়েট পরিকল্পনা তৈরি করুন'}
          </Text>
          <Text style={styles.planCtaSub}>এআই আপনার জন্য একটি ব্যক্তিগত পরিকল্পনা তৈরি করবে</Text>
        </View>
      </TouchableOpacity>

      {/* Main Ring Chart */}
      <View style={styles.ringCard}>
        <CircularProgress value={Math.round(consumedCals)} max={targetCals} color={colors.primary} />
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{Math.round(consumedProtein)}g</Text>
            <Text style={styles.macroLabel}>প্রোটিন</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBar, { backgroundColor: colors.accent, width: `${Math.min(100, (consumedProtein/targetProtein)*100)}%` }]} />
            </View>
          </View>
          
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{Math.round(consumedCarbs)}g</Text>
            <Text style={styles.macroLabel}>শর্করা</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBar, { backgroundColor: colors.warning, width: `${Math.min(100, (consumedCarbs/targetCarbs)*100)}%` }]} />
            </View>
          </View>
          
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{Math.round(consumedFat)}g</Text>
            <Text style={styles.macroLabel}>ফ্যাট</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBar, { backgroundColor: colors.error, width: `${Math.min(100, (consumedFat/targetFat)*100)}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => { haptics.light(); router.push('/(tabs)/meals'); }}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Plus size={24} color={colors.primary} />
          </View>
          <Text style={styles.actionText}>খাবার যোগ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => { haptics.light(); router.push('/(tabs)/chat'); }}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
            <Activity size={24} color={colors.accent} />
          </View>
          <Text style={styles.actionText}>এআই পুষ্টিবিদ</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Meals - Horizontal Scroll */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>আজকের পরিকল্পনা</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/meals')}>
            <Text style={styles.seeAll}>সব দেখুন</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
          {plannedMeals.map((meal: any) => {
            const isCompleted = completedSlots.includes(meal.slot);
            return (
              <View key={meal.slot} style={[styles.mealCard, isCompleted && styles.mealCardCompleted]}>
                <View style={styles.mealCardHeader}>
                  <Text style={styles.mealSlot}>{meal.slot_bn || meal.slot}</Text>
                  {isCompleted && <CheckCircle2 size={18} color={colors.success} />}
                </View>
                <Text style={styles.mealItems} numberOfLines={2}>
                  {meal.items?.map((i: any) => i.name_bn || i.name_en).join(', ')}
                </Text>
                <Text style={styles.mealCal}>{meal.target_calories} kcal</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Medicine Reminders */}
      {medicineData && medicineData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ওষুধের সময়সূচী</Text>
          {medicineData.map((med: any) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.iconCircleSmall}>
                <Pill size={20} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{med.name} <Text style={styles.medDose}>{med.dose}</Text></Text>
                <Text style={styles.medTimes}>{med.times.join(', ')} {med.with_food ? '(খাবারের পর)' : ''}</Text>
              </View>
              <TouchableOpacity>
                <CheckCircle2 size={24} color={colors.border} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Health Snapshot */}
      {reportData?.latest_health_log && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>স্বাস্থ্য আপডেট</Text>
          <View style={styles.healthRow}>
            <View style={styles.healthBox}>
              <Text style={styles.healthValue}>{reportData.latest_health_log.weight_kg || '--'}</Text>
              <Text style={styles.healthLabel}>ওজন (কেজি)</Text>
            </View>
            <View style={styles.healthBox}>
              <Text style={styles.healthValue}>{reportData.latest_health_log.blood_pressure || '--'}</Text>
              <Text style={styles.healthLabel}>রক্তচাপ</Text>
            </View>
            <View style={styles.healthBox}>
              <Text style={styles.healthValue}>{reportData.latest_health_log.blood_sugar || '--'}</Text>
              <Text style={styles.healthLabel}>সুগার</Text>
            </View>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  header: { marginBottom: spacing.lg, paddingTop: 40 },
  greeting: { fontFamily: fonts.bnBold, fontSize: 28, color: colors.textPrimary },
  subGreeting: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary },
  
  planCtaCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  planCtaIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  planCtaText: { flex: 1 },
  planCtaTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary },
  planCtaSub: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  
  ringCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  ringValue: { fontFamily: fonts.display, fontSize: 40, color: colors.textPrimary },
  ringLabel: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary, marginTop: -4 },
  
  macrosContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: spacing.xl },
  macroCol: { flex: 1, alignItems: 'center' },
  macroValue: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  macroLabel: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  macroBarBg: { width: '80%', height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, overflow: 'hidden' },
  macroBar: { height: '100%', borderRadius: 2 },
  
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  actionBtn: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionText: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.bnBold, fontSize: 20, color: colors.textPrimary },
  seeAll: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.primary },
  
  mealCard: { width: width * 0.45, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  mealCardCompleted: { borderColor: colors.success, backgroundColor: colors.success + '10' },
  mealCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  mealSlot: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  mealItems: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm, height: 40 },
  mealCal: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.primary },
  
  medCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  iconCircleSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  medName: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  medDose: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary },
  medTimes: { fontFamily: fonts.bn, fontSize: 14, color: colors.primary, marginTop: 2 },
  
  healthRow: { flexDirection: 'row', gap: spacing.sm },
  healthBox: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  healthValue: { fontFamily: fonts.display, fontSize: 20, color: colors.textPrimary, marginBottom: 4 },
  healthLabel: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary },
});
