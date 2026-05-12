import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import {
  TrendingUp, Flame, Mail, CheckCircle, BarChart3,
  Scale, AlertCircle, Calendar, Zap,
} from 'lucide-react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
const BarChart = ({ data, target }: { data: number[]; target: number }) => {
  const W = 300;
  const H = 100;
  const MAX = Math.max(...data, target) * 1.1;
  const barW = (W / data.length) * 0.6;
  const gap = W / data.length;

  return (
    <Svg width={W} height={H + 20}>
      {/* Target line */}
      <Line
        x1={0} y1={H - (target / MAX) * H}
        x2={W} y2={H - (target / MAX) * H}
        stroke={colors.accent} strokeWidth={1.5} strokeDasharray="4,4"
      />
      {data.map((val, i) => {
        const barH = (val / MAX) * H;
        const x = i * gap + (gap - barW) / 2;
        const fill = val > target * 1.1 ? colors.error : val > target * 0.85 ? colors.success : colors.primary;
        return (
          <G key={i}>
            <Rect x={x} y={H - barH} width={barW} height={barH} rx={4} fill={fill} opacity={0.85} />
          </G>
        );
      })}
    </Svg>
  );
};

// ── Mini Line Chart ───────────────────────────────────────────────────────────
const LineChart = ({ points }: { points: number[] }) => {
  if (points.length < 2) return null;
  const W = 300;
  const H = 80;
  const MIN = Math.min(...points) * 0.98;
  const MAX = Math.max(...points) * 1.02;
  const scaleX = (i: number) => (i / (points.length - 1)) * W;
  const scaleY = (v: number) => H - ((v - MIN) / (MAX - MIN)) * H;

  const pathD = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(v).toFixed(1)}`)
    .join(' ');

  return (
    <Svg width={W} height={H + 24}>
      <SvgText x={0} y={H + 16} fontSize={10} fill={colors.textSecondary}>
        {MIN.toFixed(1)}
      </SvgText>
      <SvgText x={W - 24} y={H + 16} fontSize={10} fill={colors.textSecondary}>
        {MAX.toFixed(1)}
      </SvgText>
      {/* Line */}
      <SvgText>
        {/* Using polyline approach via Rect trick */}
      </SvgText>
      {points.map((v, i) => (
        <Rect
          key={i}
          x={scaleX(i) - 3}
          y={scaleY(v) - 3}
          width={6}
          height={6}
          rx={3}
          fill={colors.primary}
        />
      ))}
    </Svg>
  );
};

export default function ReportScreen() {
  const user = useAuthStore((s) => s.user);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [emailSent, setEmailSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: nutrition, isLoading: nLoad, refetch: refetchN } = useQuery({
    queryKey: ['nutrition_report'],
    queryFn: async () => (await reportsApi.nutrition()).data,
  });

  const { data: conditions, isLoading: cLoad, refetch: refetchC } = useQuery({
    queryKey: ['condition_report'],
    queryFn: async () => (await reportsApi.conditions()).data,
  });

  const emailMutation = useMutation({
    mutationFn: () => reportsApi.sendEmail(emailInput, 'bn'),
    onSuccess: () => setEmailSent(true),
    onError: () => Alert.alert('ত্রুটি', 'ইমেইল পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।'),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchN(), refetchC()]);
    setRefreshing(false);
  }, []);

  const isLoading = nLoad || cLoad;
  const targets = nutrition?.targets;
  const weeklyLogs = conditions?.weekly_summary || [];

  // Build calorie history from weekly logs
  const calHistory: number[] = weeklyLogs.map((d: any) => d.consumed_calories || 0).slice(-7);
  const weightHistory: number[] = weeklyLogs.map((d: any) => d.weight_kg).filter(Boolean).slice(-7);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.screenTitle}>সাপ্তাহিক রিপোর্ট</Text>
        <Text style={styles.screenSub}>গত ৭ দিনের স্বাস্থ্য সারসংক্ষেপ</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>রিপোর্ট লোড হচ্ছে...</Text>
        </View>
      ) : (
        <>
          {/* ── Summary Cards ──────────────────────────────────────────────── */}
          {targets && (
            <View style={styles.summaryRow}>
              {[
                { icon: Flame, label: 'ক্যালরি লক্ষ্য', value: `${targets.target_calories}`, unit: 'kcal', color: colors.primary },
                { icon: Scale, label: 'BMI', value: `${targets.bmi?.toFixed(1) || '--'}`, unit: '', color: colors.accent },
                { icon: TrendingUp, label: 'প্রোটিন', value: `${targets.protein_g || '--'}`, unit: 'g', color: colors.success },
              ].map(({ icon: Icon, label, value, unit, color }) => (
                <View key={label} style={styles.summaryCard}>
                  <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
                    <Icon size={20} color={color} />
                  </View>
                  <Text style={styles.summaryValue}>{value}<Text style={styles.summaryUnit}>{unit}</Text></Text>
                  <Text style={styles.summaryLabel}>{label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── AI Narrative ───────────────────────────────────────────────── */}
          {conditions?.ai_narrative && (
            <View style={styles.narrativeCard}>
              <View style={styles.narrativeHeader}>
                <Zap size={18} color={colors.accent} />
                <Text style={styles.narrativeTitle}>এআই বিশ্লেষণ</Text>
              </View>
              <Text style={styles.narrativeText}>{conditions.ai_narrative}</Text>
            </View>
          )}

          {/* ── Calorie Bar Chart ──────────────────────────────────────────── */}
          {calHistory.length > 1 && targets?.target_calories && (
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <BarChart3 size={18} color={colors.primary} />
                <Text style={styles.chartTitle}>দৈনিক ক্যালরি</Text>
              </View>
              <Text style={styles.chartLegend}>
                <Text style={{ color: colors.accent }}>---</Text> লক্ষ্য ({targets.target_calories} kcal)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart data={calHistory} target={targets.target_calories} />
              </ScrollView>
            </View>
          )}

          {/* ── Weight Line Chart ──────────────────────────────────────────── */}
          {weightHistory.length > 1 && (
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Scale size={18} color={colors.accent} />
                <Text style={styles.chartTitle}>ওজনের পরিবর্তন (কেজি)</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart points={weightHistory} />
              </ScrollView>
            </View>
          )}

          {/* ── Macro Balance ──────────────────────────────────────────────── */}
          {targets && (
            <View style={styles.macroCard}>
              <Text style={styles.chartTitle}>ম্যাক্রো বিভাজন লক্ষ্য</Text>
              <View style={styles.macroRows}>
                {[
                  { label: 'প্রোটিন', val: targets.protein_g, total: targets.target_calories / 4, color: colors.accent },
                  { label: 'শর্করা', val: targets.carbs_g, total: targets.target_calories / 4, color: colors.warning },
                  { label: 'ফ্যাট', val: targets.fat_g, total: targets.target_calories / 9, color: colors.error },
                ].map(({ label, val, total, color }) => (
                  <View key={label} style={styles.macroRow}>
                    <Text style={styles.macroLabel}>{label}</Text>
                    <View style={styles.macroBarBg}>
                      <View style={[styles.macroBarFill, { width: `${Math.min(100, (val / total) * 100)}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.macroVal}>{val}g</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Weekly Day Table ───────────────────────────────────────────── */}
          {weeklyLogs.length > 0 && (
            <View style={styles.tableCard}>
              <View style={styles.chartHeader}>
                <Calendar size={18} color={colors.textSecondary} />
                <Text style={styles.chartTitle}>দৈনিক বিবরণ</Text>
              </View>
              {weeklyLogs.slice(-7).map((log: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableDate}>{log.date || `দিন ${i + 1}`}</Text>
                  <Text style={styles.tableCal}>{log.consumed_calories || 0} kcal</Text>
                  {log.weight_kg ? (
                    <Text style={styles.tableWeight}>{log.weight_kg} kg</Text>
                  ) : (
                    <Text style={styles.tableMissing}>—</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ── Email Report Card ──────────────────────────────────────────── */}
          <View style={styles.emailCard}>
            <View style={styles.chartHeader}>
              <Mail size={18} color={colors.primary} />
              <Text style={styles.chartTitle}>ইমেইলে রিপোর্ট পাঠান</Text>
            </View>
            {emailSent ? (
              <View style={styles.emailSuccessRow}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={styles.emailSuccessText}>রিপোর্ট পাঠানো হয়েছে!</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.emailInput}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="আপনার ইমেইল ঠিকানা"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.emailBtn, (!emailInput.includes('@') || emailMutation.isPending) && styles.emailBtnDisabled]}
                  onPress={() => emailMutation.mutate()}
                  disabled={!emailInput.includes('@') || emailMutation.isPending}
                >
                  {emailMutation.isPending
                    ? <ActivityIndicator color={colors.white} />
                    : <Text style={styles.emailBtnText}>পাঠান</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  screenTitle: { fontFamily: fonts.bnBold, fontSize: 28, color: colors.textPrimary },
  screenSub: { fontFamily: fonts.bn, fontSize: 15, color: colors.textSecondary, marginTop: 4 },

  loadingBox: { alignItems: 'center', paddingVertical: 80, gap: spacing.md },
  loadingText: { fontFamily: fonts.bn, fontSize: 16, color: colors.textSecondary },

  summaryRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.border,
  },
  summaryIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  summaryValue: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary },
  summaryUnit: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary },
  summaryLabel: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary, textAlign: 'center' },

  narrativeCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.primary + '12', borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.primary + '30', padding: spacing.lg,
  },
  narrativeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  narrativeTitle: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  narrativeText: { fontFamily: fonts.bn, fontSize: 15, color: colors.textPrimary, lineHeight: 26 },

  chartCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  chartTitle: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  chartLegend: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },

  macroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
  },
  macroRows: { marginTop: spacing.md, gap: spacing.md },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  macroLabel: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.textPrimary, width: 60 },
  macroBarBg: { flex: 1, height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  macroBarFill: { height: '100%', borderRadius: 4 },
  macroVal: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.textSecondary, width: 48, textAlign: 'right' },

  tableCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
  },
  tableRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tableDate: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, flex: 1 },
  tableCal: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.primary, width: 80, textAlign: 'center' },
  tableWeight: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.accent, width: 60, textAlign: 'right' },
  tableMissing: { fontFamily: fonts.bn, fontSize: 14, color: colors.border, width: 60, textAlign: 'right' },

  emailCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md,
  },
  emailInput: {
    backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md,
    fontFamily: fonts.body, fontSize: 16, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  emailBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  emailBtnDisabled: { opacity: 0.5 },
  emailBtnText: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.white },
  emailSuccessRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  emailSuccessText: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.success },
});
