import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mealTrackingApi } from '../../lib/api';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import {
  PenLine, Send, Flame, Clock, CheckCircle2,
  Info, AlertTriangle, UtensilsCrossed,
} from 'lucide-react-native';
import { useHaptics } from '../../hooks/useHaptics';

type MealSlot = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'other';

const SLOTS: { id: MealSlot; label: string }[] = [
  { id: 'breakfast', label: 'সকাল' },
  { id: 'morning_snack', label: 'স্ন্যাক' },
  { id: 'lunch', label: 'দুপুর' },
  { id: 'evening_snack', label: 'বিকেল' },
  { id: 'dinner', label: 'রাত' },
  { id: 'other', label: 'অন্য' },
];

interface TrackLog {
  id: string;
  input: string;
  total_calories: number;
  ai_feedback: string;
  macros?: { protein_g: number; carbs_g: number; fat_g: number };
  meal_slot?: string;
  created_at: string;
  warning?: string;
}

export default function MealTrackerView() {
  const [input, setInput] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('other');
  const haptics = useHaptics();

  const { data: logsData, refetch: refetchLogs } = useQuery({
    queryKey: ['daily_tracking'],
    queryFn: async () => {
      const res = await mealTrackingApi.today();
      return res.data as TrackLog[];
    },
  });

  const logMutation = useMutation({
    mutationFn: async () => {
      const res = await mealTrackingApi.log(input.trim(), selectedSlot, 'bn');
      return res.data;
    },
    onSuccess: () => {
      haptics.success();
      setInput('');
      refetchLogs();
    },
    onError: () => haptics.error(),
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    haptics.medium();
    logMutation.mutate();
  };

  const totalTrackedCals = (logsData || []).reduce(
    (sum, l) => sum + (l.total_calories || 0), 0
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <PenLine size={18} color={colors.primary} />
            <Text style={styles.inputTitle}>আজকের খাবার লিখুন</Text>
          </View>
          <Text style={styles.inputHint}>
            যা খেয়েছেন সহজ ভাষায় লিখুন — এআই বাকিটা বুঝে নেবে।
          </Text>

          {/* Slot Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.slotScroll}
            contentContainerStyle={styles.slotRow}
          >
            {SLOTS.map(({ id, label }) => (
              <TouchableOpacity
                key={id}
                style={[styles.slotChip, selectedSlot === id && styles.slotChipActive]}
                onPress={() => setSelectedSlot(id)}
              >
                <Text style={[styles.slotText, selectedSlot === id && styles.slotTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text Input */}
          <TextInput
            style={styles.textArea}
            placeholder="যেমন: দুপুরে এক প্লেট ভাত, ডাল আর মুরগির মাংস খেয়েছি..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Example prompts */}
          {input.length === 0 && (
            <View style={styles.examples}>
              {[
                'সকালে ২টা পরোটা আর এক কাপ চা খেয়েছি',
                '২ পিস রুটি, ডিম সিদ্ধ আর কলা',
              ].map((ex, i) => (
                <TouchableOpacity key={i} style={styles.exampleChip} onPress={() => setInput(ex)}>
                  <Text style={styles.exampleText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (!input.trim() || logMutation.isPending) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!input.trim() || logMutation.isPending}
          >
            {logMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Send size={18} color={colors.white} />
                <Text style={styles.submitText}>রেকর্ড করুন</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Error */}
          {logMutation.isError && (
            <View style={styles.warningBox}>
              <AlertTriangle size={14} color={colors.error} />
              <Text style={styles.warningText}>রেকর্ড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</Text>
            </View>
          )}
        </View>

        {/* Latest AI Response */}
        {logMutation.data && (
          <View style={styles.aiResponseCard}>
            <View style={styles.aiHeader}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={styles.aiTitle}>এআই বিশ্লেষণ</Text>
            </View>
            <Text style={styles.aiFeedback}>{logMutation.data.ai_feedback}</Text>
            <View style={styles.aiMacros}>
              <Text style={styles.aiMacroItem}>
                🔥 {logMutation.data.total_calories} kcal
              </Text>
              {logMutation.data.macros?.protein_g != null && (
                <Text style={styles.aiMacroItem}>
                  💪 {Math.round(logMutation.data.macros.protein_g)}g প্রোটিন
                </Text>
              )}
            </View>
            {logMutation.data.warning && (
              <View style={styles.warningBox}>
                <AlertTriangle size={14} color={colors.warning} />
                <Text style={styles.warningText}>{logMutation.data.warning}</Text>
              </View>
            )}
          </View>
        )}

        {/* Today's Tracked Logs */}
        {logsData && logsData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>আজকের রেকর্ড</Text>
              <View style={styles.totalCalBadge}>
                <Flame size={14} color={colors.primary} />
                <Text style={styles.totalCalText}>{totalTrackedCals} kcal মোট</Text>
              </View>
            </View>

            {logsData.map((log, i) => {
              const time = new Date(log.created_at).toLocaleTimeString('bn-BD', {
                hour: '2-digit', minute: '2-digit',
              });
              return (
                <View key={log.id || i} style={styles.logCard}>
                  <View style={styles.logTop}>
                    <Text style={styles.logInput} numberOfLines={2}>{log.input}</Text>
                    <View style={styles.logCalBadge}>
                      <Text style={styles.logCal}>{log.total_calories}</Text>
                      <Text style={styles.logCalUnit}>kcal</Text>
                    </View>
                  </View>
                  <Text style={styles.logFeedback} numberOfLines={2}>{log.ai_feedback}</Text>
                  <View style={styles.logMeta}>
                    {log.meal_slot && (
                      <View style={styles.slotBadge}>
                        <UtensilsCrossed size={11} color={colors.textSecondary} />
                        <Text style={styles.slotBadgeText}>{log.meal_slot}</Text>
                      </View>
                    )}
                    <View style={styles.timeBadge}>
                      <Clock size={11} color={colors.textSecondary} />
                      <Text style={styles.timeBadgeText}>{time}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {(!logsData || logsData.length === 0) && !logMutation.data && (
          <View style={styles.emptyState}>
            <UtensilsCrossed size={40} color={colors.border} />
            <Text style={styles.emptyTitle}>আজ কোনো রেকর্ড নেই</Text>
            <Text style={styles.emptyText}>উপরে আপনার খাবার লিখুন — এআই ক্যালরি ও পুষ্টি হিসাব করে দেবে।</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },

  inputCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
  },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  inputTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary },
  inputHint: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },

  slotScroll: { marginBottom: spacing.md },
  slotRow: { gap: spacing.sm },
  slotChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.pill,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.textSecondary },
  slotTextActive: { color: colors.white },

  textArea: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, fontFamily: fonts.bn, fontSize: 16,
    color: colors.textPrimary, minHeight: 100, marginBottom: spacing.md,
  },

  examples: { gap: spacing.sm, marginBottom: spacing.md },
  exampleChip: {
    backgroundColor: colors.primary + '12', borderRadius: radius.md,
    padding: spacing.sm, borderWidth: 1, borderColor: colors.primary + '30',
  },
  exampleText: { fontFamily: fonts.bn, fontSize: 13, color: colors.primary },

  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingVertical: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },

  warningBox: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.error + '12',
    borderRadius: radius.md, padding: spacing.md, alignItems: 'flex-start', marginTop: spacing.sm,
  },
  warningText: { flex: 1, fontFamily: fonts.bn, fontSize: 13, color: colors.textPrimary },

  aiResponseCard: {
    backgroundColor: colors.success + '0F', borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.success + '40', padding: spacing.lg, gap: spacing.sm,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiTitle: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  aiFeedback: { fontFamily: fonts.bn, fontSize: 15, color: colors.textPrimary, lineHeight: 24 },
  aiMacros: { flexDirection: 'row', gap: spacing.md },
  aiMacroItem: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.textSecondary },

  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.bnBold, fontSize: 20, color: colors.textPrimary },
  totalCalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '18', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 },
  totalCalText: { fontFamily: fonts.bnBold, fontSize: 13, color: colors.primary },

  logCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  logInput: { flex: 1, fontFamily: fonts.bnBold, fontSize: 15, color: colors.textPrimary },
  logCalBadge: { alignItems: 'center', backgroundColor: colors.primary + '18', borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 8 },
  logCal: { fontFamily: fonts.display, fontSize: 18, color: colors.primary },
  logCalUnit: { fontFamily: fonts.bn, fontSize: 11, color: colors.primary },
  logFeedback: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  logMeta: { flexDirection: 'row', gap: spacing.sm },
  slotBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLight, borderRadius: radius.sm, paddingVertical: 3, paddingHorizontal: 8 },
  slotBadgeText: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLight, borderRadius: radius.sm, paddingVertical: 3, paddingHorizontal: 8 },
  timeBadgeText: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.bnBold, fontSize: 20, color: colors.textPrimary },
  emptyText: { fontFamily: fonts.bn, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
