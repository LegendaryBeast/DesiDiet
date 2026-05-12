import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealPlanApi } from '../../lib/api';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import {
  CalendarDays, Check, ArrowLeftRight,
  ChevronDown, ChevronUp, RefreshCw, Flame,
} from 'lucide-react-native';
import { MealPlanSkeleton } from '../SkeletonLoader';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  onSwapRequest: (items: string[]) => void;
  onChatRequest?: (preMessage: string) => void;
}

type ViewMode = 'daily' | 'weekly';

const SLOT_TIMES: Record<string, string> = {
  breakfast: 'সকাল ৭টা',
  morning_snack: 'সকাল ১০টা',
  lunch: 'দুপুর ১টা',
  evening_snack: 'বিকেল ৪টা',
  dinner: 'রাত ৮টা',
};

export default function MealPlanView({ onSwapRequest, onChatRequest }: Props) {
  const [mode, setMode] = useState<ViewMode>('daily');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();
  const haptics = useHaptics();
  const router = useRouter();

  // ── Daily Plan Query ──────────────────────────────────────────────────────
  const dailyQ = useQuery({
    queryKey: ['daily_plan'],
    queryFn: async () => (await mealPlanApi.daily('bn')).data,
    enabled: mode === 'daily',
  });

  // ── Weekly Plan Query ─────────────────────────────────────────────────────
  const weeklyQ = useQuery({
    queryKey: ['weekly_plan'],
    queryFn: async () => (await mealPlanApi.weekly('bn')).data,
    enabled: mode === 'weekly',
  });

  // ── Mark-Complete Mutation ────────────────────────────────────────────────
  const markMutation = useMutation({
    mutationFn: async ({ planId, slot, completed }: { planId: string; slot: string; completed: boolean }) => {
      return mealPlanApi.markComplete(planId, slot, completed);
    },
    onSuccess: (_, vars) => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['daily_plan'] });
    },
    onError: () => haptics.error(),
  });

  const isLoading = mode === 'daily' ? dailyQ.isLoading : weeklyQ.isLoading;
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (mode === 'daily') await dailyQ.refetch();
    else await weeklyQ.refetch();
    setRefreshing(false);
  }, [mode]);

  if (isLoading && !refreshing) return <MealPlanSkeleton />;

  // Parse completed slots from plan response
  const getCompletedSlots = (planResponse: any): string[] => {
    const raw = planResponse?.completed_slots;
    if (!raw) return [];
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return []; }
  };

  // ── Render individual meal card ───────────────────────────────────────────
  const renderMealCard = (meal: any, planId: string, completedSlots: string[]) => {
    const isCompleted = completedSlots.includes(meal.slot);
    const foodItems: string[] = (meal.items || []).map((i: any) => i.name_bn || i.name_en || '');

    return (
      <View key={meal.slot} style={[styles.mealCard, isCompleted && styles.mealCardDone]}>
        {/* Meal Header Row */}
        <View style={styles.mealRowTop}>
          <View style={styles.mealTitleGroup}>
            <Text style={styles.mealSlot}>{meal.slot_bn || meal.slot}</Text>
            <Text style={styles.mealTime}>{SLOT_TIMES[meal.slot] || ''}</Text>
          </View>
          <View style={styles.mealActions}>
            {/* Swap */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => { haptics.light(); onSwapRequest(foodItems); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeftRight size={16} color={colors.accent} strokeWidth={2} />
            </TouchableOpacity>
            {/* Mark Eaten */}
            <TouchableOpacity
              style={[styles.checkBtn, isCompleted && styles.checkBtnDone]}
              onPress={() => {
                haptics.light();
                markMutation.mutate({ planId, slot: meal.slot, completed: !isCompleted });
              }}
              disabled={markMutation.isPending}
            >
              <Check size={14} color={isCompleted ? colors.white : colors.textSecondary} strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Foods */}
        <Text style={styles.mealItems}>{foodItems.join(' • ')}</Text>

        {/* Calorie badge */}
        <View style={styles.calBadge}>
          <Flame size={12} color={colors.primary} />
          <Text style={styles.calText}>{meal.target_calories} kcal</Text>
        </View>
      </View>
    );
  };

  // ── Render daily view ─────────────────────────────────────────────────────
  const renderDaily = () => {
    const plan = dailyQ.data;
    if (!plan || plan.error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>আজকের পরিকল্পনা নেই</Text>
          <Text style={styles.emptyText}>
            আপনার স্বাস্থ্য অবস্থা ও পছন্দ অনুযায়ী এআই একটি ব্যক্তিগত খাবার পরিকল্পনা তৈরি করবে।
          </Text>

          {/* AI Suggestions */}
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionTitle}>💡 এআই পরামর্শ</Text>
            {[
              '🥗 আপনার অবস্থার জন্য উপযুক্ত খাবার বেছে নেওয়া হবে',
              '📊 ক্যালরি ও পুষ্টি লক্ষ্যমাত্রা অনুযায়ী সাজানো হবে',
              '🔄 পছন্দ না হলে যেকোনো আইটেম বদলাতে পারবেন',
            ].map((t, i) => (
              <Text key={i} style={styles.suggestionItem}>{t}</Text>
            ))}
          </View>

          {/* Generate button */}
          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            disabled={generating}
            onPress={async () => {
              haptics.medium();
              setGenerating(true);
              try {
                await mealPlanApi.daily('bn');
                queryClient.invalidateQueries({ queryKey: ['daily_plan'] });
                await dailyQ.refetch();
              } catch {
                Alert.alert('ত্রুটি', 'পরিকল্পনা তৈরি করতে পারেনি। পরে আবার চেষ্টা করুন।');
              } finally {
                setGenerating(false);
              }
            }}
          >
            {generating
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.generateBtnText}>🤖 এআই পরিকল্পনা তৈরি করুন</Text>
            }
          </TouchableOpacity>

          {/* Ask AI instead */}
          <TouchableOpacity
            style={styles.askAiBtn}
            onPress={() => {
              haptics.light();
              if (onChatRequest) {
                onChatRequest('আজকের জন্য আমার স্বাস্থ্য অবস্থা অনুযায়ী একটি খাবার পরিকল্পনা দিন।');
              } else {
                router.push('/(tabs)/chat');
              }
            }}
          >
            <Text style={styles.askAiBtnText}>💬 এআই-এর সাথে কথা বলুন</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const planData = plan.plan_data;
    const planId = plan.id;
    const completedSlots = getCompletedSlots(plan);
    const completedCount = completedSlots.length;
    const totalMeals = (planData?.meals || []).length;

    return (
      <View>
        {/* Day summary */}
        <View style={styles.daySummary}>
          <View style={styles.daySummaryLeft}>
            <CalendarDays size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.dayTitle}>আজকের খাবার</Text>
          </View>
          <View style={styles.daySummaryRight}>
            <Text style={styles.dayProgress}>{completedCount}/{totalMeals} সম্পন্ন</Text>
            <Text style={styles.dayCalTarget}>{planData?.target_calories} kcal</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${totalMeals > 0 ? (completedCount / totalMeals) * 100 : 0}%` }]} />
        </View>

        {/* Meal cards */}
        {(planData?.meals || []).map((meal: any) =>
          renderMealCard(meal, planId, completedSlots)
        )}
      </View>
    );
  };

  // ── Render weekly view ────────────────────────────────────────────────────
  const renderWeekly = () => {
    const plans = weeklyQ.data;
    if (!plans || plans.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>সাপ্তাহিক পরিকল্পনা নেই</Text>
          <Text style={styles.emptyText}>এআই শীঘ্রই আপনার সাপ্তাহিক পরিকল্পনা প্রস্তুত করবে।</Text>
        </View>
      );
    }

    const DAY_NAMES = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];

    return (
      <View>
        {plans.map((item: any, idx: number) => {
          const planData = item.plan_data;
          const planId = item.id;
          const completedSlots = getCompletedSlots(item);
          const date = item.plan_date ? new Date(item.plan_date) : new Date();
          const isExpanded = expandedDay === idx;

          return (
            <View key={item.id || idx} style={styles.weekCard}>
              <TouchableOpacity
                style={styles.weekCardHeader}
                onPress={() => setExpandedDay(isExpanded ? null : idx)}
              >
                <View style={styles.weekDayMeta}>
                  <Text style={styles.weekDayName}>{DAY_NAMES[date.getDay()]}</Text>
                  <Text style={styles.weekDayDate}>{date.toLocaleDateString('bn-BD')}</Text>
                </View>
                <View style={styles.weekDayRight}>
                  <Text style={styles.weekDayCal}>{planData?.target_calories} kcal</Text>
                  {isExpanded
                    ? <ChevronUp size={18} color={colors.textSecondary} />
                    : <ChevronDown size={18} color={colors.textSecondary} />}
                </View>
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.weekCardBody}>
                  {(planData?.meals || []).map((meal: any) =>
                    renderMealCard(meal, planId, completedSlots)
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Daily / Weekly toggle */}
      <View style={styles.toggleRow}>
        {(['daily', 'weekly'] as ViewMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
              {m === 'daily' ? 'আজকের' : 'সাপ্তাহিক'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>এআই পরিকল্পনা লোড হচ্ছে...</Text>
        </View>
      ) : mode === 'daily' ? renderDaily() : renderWeekly()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontFamily: fonts.bnBold, fontSize: 15, color: colors.textSecondary },
  toggleTextActive: { color: colors.white },

  loadingBox: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  loadingText: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: spacing.md },
  emptyEmoji: { fontSize: 52, marginBottom: spacing.sm },
  emptyTitle: { fontFamily: fonts.bnBold, fontSize: 22, color: colors.textPrimary },
  emptyText: { fontFamily: fonts.bn, fontSize: 15, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.md, lineHeight: 24 },

  suggestionBox: {
    width: '100%', backgroundColor: colors.primary + '12',
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.primary + '25',
    gap: spacing.sm,
  },
  suggestionTitle: { fontFamily: fonts.bnBold, fontSize: 15, color: colors.textPrimary, marginBottom: 2 },
  suggestionItem: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  generateBtn: {
    width: '100%', backgroundColor: colors.primary,
    borderRadius: radius.pill, paddingVertical: spacing.md,
    alignItems: 'center',
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { fontFamily: fonts.bnBold, fontSize: 17, color: colors.white },

  askAiBtn: {
    width: '100%', borderRadius: radius.pill, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary,
  },
  askAiBtnText: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.primary },

  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary },
  retryText: { fontFamily: fonts.bnBold, fontSize: 15, color: colors.primary },

  daySummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  daySummaryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayTitle: { fontFamily: fonts.bnBold, fontSize: 20, color: colors.textPrimary },
  daySummaryRight: { alignItems: 'flex-end' },
  dayProgress: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.success },
  dayCalTarget: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary },

  progressBg: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, marginBottom: spacing.lg, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealCardDone: { borderColor: colors.success + '60', backgroundColor: colors.success + '0A' },

  mealRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  mealTitleGroup: { flex: 1 },
  mealSlot: { fontFamily: fonts.bnBold, fontSize: 17, color: colors.textPrimary },
  mealTime: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  mealActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: 6, borderRadius: radius.sm, backgroundColor: colors.accent + '18' },
  checkBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { backgroundColor: colors.success, borderColor: colors.success },

  mealItems: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.sm },
  calBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: colors.primary + '18', borderRadius: radius.sm, paddingVertical: 3, paddingHorizontal: 8 },
  calText: { fontFamily: fonts.bnBold, fontSize: 13, color: colors.primary },

  weekCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  weekCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  weekDayMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weekDayName: { fontFamily: fonts.bnBold, fontSize: 17, color: colors.textPrimary },
  weekDayDate: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary },
  weekDayRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weekDayCal: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.primary },
  weekCardBody: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md },
});
