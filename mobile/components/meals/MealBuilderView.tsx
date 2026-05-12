import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, FlatList,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mealBuilderApi, foodsApi } from '../../lib/api';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import {
  Search, Plus, X, Zap, AlertTriangle,
  CheckCircle, MinusCircle, Info, Flame,
} from 'lucide-react-native';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  preFillItems: string[] | null;
  onClearPreFill: () => void;
}

interface FoodEntry {
  name: string;
  quantity: string; // e.g. "1 cup", "200g"
  insight?: string;
  safety?: 'safe' | 'caution' | 'avoid';
}

interface AnalysisResult {
  grade: 'A' | 'B' | 'C' | 'D';
  total_calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  insights: string;
  warnings: string[];
  suggestions: string[];
}

const GRADE_COLORS = {
  A: colors.success,
  B: '#4ADE80',
  C: colors.warning,
  D: colors.error,
};

export default function MealBuilderView({ preFillItems, onClearPreFill }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [mealSlot, setMealSlot] = useState('custom');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const haptics = useHaptics();

  // Apply pre-fill when coming from swap in Plan tab
  useEffect(() => {
    if (preFillItems && preFillItems.length > 0) {
      setFoodEntries(preFillItems.map((name) => ({ name, quantity: '1 serving' })));
      setAnalysis(null);
      onClearPreFill();
    }
  }, [preFillItems]);

  // Debounced food search
  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await foodsApi.searchWithInsight(query, mealSlot);
        setSearchResults(res.data?.results || []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 500);
  }, [query, mealSlot]);

  const addFood = (item: any) => {
    haptics.light();
    setFoodEntries((prev) => [
      ...prev,
      {
        name: item.name_bn || item.name_en,
        quantity: '1 serving',
        insight: item.insight,
        safety: item.safety,
      },
    ]);
    setQuery('');
    setSearchResults([]);
    setAnalysis(null);
  };

  const removeFood = (index: number) => {
    setFoodEntries((prev) => prev.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const updateQuantity = (index: number, qty: string) => {
    setFoodEntries((prev) =>
      prev.map((f, i) => (i === index ? { ...f, quantity: qty } : f))
    );
  };

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await mealBuilderApi.analyze({
        items: foodEntries.map((f) => ({ name: f.name, quantity: f.quantity })),
        meal_slot: mealSlot,
        language: 'bn',
      });
      return res.data as AnalysisResult;
    },
    onMutate: () => haptics.medium(),
    onSuccess: (data) => { haptics.success(); setAnalysis(data); },
    onError: () => haptics.error(),
  });

  const SafetyIcon = ({ level }: { level?: string }) => {
    if (level === 'avoid') return <AlertTriangle size={14} color={colors.error} />;
    if (level === 'caution') return <MinusCircle size={14} color={colors.warning} />;
    return <CheckCircle size={14} color={colors.success} />;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="খাবার খুঁজুন (যেমন: ভাত, ডাল)"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
          {query.length > 0 && !searching && (
            <TouchableOpacity onPress={() => { setQuery(''); setSearchResults([]); }}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.dropdown}>
            {searchResults.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.dropdownItem}
                onPress={() => addFood(item)}
              >
                <View style={styles.dropdownLeft}>
                  <SafetyIcon level={item.safety} />
                  <Text style={styles.dropdownName}>{item.name_bn || item.name_en}</Text>
                </View>
                <View style={styles.dropdownRight}>
                  {item.calories_per_100g && (
                    <Text style={styles.dropdownCal}>{item.calories_per_100g} kcal</Text>
                  )}
                  <Plus size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Added foods list */}
      {foodEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>যোগ করা খাবার</Text>
          {foodEntries.map((food, idx) => (
            <View key={idx} style={[styles.foodRow, food.safety === 'avoid' && styles.foodRowDanger]}>
              <View style={styles.foodInfo}>
                <View style={styles.foodNameRow}>
                  <SafetyIcon level={food.safety} />
                  <Text style={styles.foodName}>{food.name}</Text>
                </View>
                {food.insight && (
                  <Text style={styles.foodInsight}>{food.insight}</Text>
                )}
              </View>
              <View style={styles.foodQtyRow}>
                <TextInput
                  style={styles.qtyInput}
                  value={food.quantity}
                  onChangeText={(v) => updateQuantity(idx, v)}
                  placeholder="পরিমাণ"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => removeFood(idx)}>
                  <X size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Analyze Button */}
      {foodEntries.length > 0 && (
        <TouchableOpacity
          style={[styles.analyzeBtn, analyzeMutation.isPending && styles.analyzeBtnDisabled]}
          onPress={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
        >
          {analyzeMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Zap size={18} color={colors.white} strokeWidth={2.5} />
              <Text style={styles.analyzeBtnText}>এআই বিশ্লেষণ করুন</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {foodEntries.length === 0 && (
        <View style={styles.emptyHint}>
          <Search size={40} color={colors.border} />
          <Text style={styles.emptyHintTitle}>খাবার যোগ করুন</Text>
          <Text style={styles.emptyHintText}>
            উপরে খাবার খুঁজুন এবং যোগ করুন। এআই আপনার স্বাস্থ্য অবস্থার সাথে মিলিয়ে বিশ্লেষণ করবে।
          </Text>
        </View>
      )}

      {/* Analysis Result */}
      {analysis && (
        <View style={styles.resultCard}>
          {/* Grade */}
          <View style={styles.gradeRow}>
            <View style={[styles.gradeBadge, { backgroundColor: GRADE_COLORS[analysis.grade] + '20', borderColor: GRADE_COLORS[analysis.grade] }]}>
              <Text style={[styles.gradeText, { color: GRADE_COLORS[analysis.grade] }]}>
                {analysis.grade}
              </Text>
            </View>
            <View>
              <Text style={styles.resultTitle}>খাবার বিশ্লেষণ</Text>
              <Text style={styles.resultSubtitle}>গ্রেড: {analysis.grade} • {analysis.total_calories} kcal</Text>
            </View>
          </View>

          {/* Macros */}
          <View style={styles.macrosRow}>
            {[
              { label: 'প্রোটিন', value: analysis.macros.protein_g, color: colors.accent },
              { label: 'শর্করা', value: analysis.macros.carbs_g, color: colors.warning },
              { label: 'ফ্যাট', value: analysis.macros.fat_g, color: colors.error },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.macroBox}>
                <Text style={[styles.macroValue, { color }]}>{Math.round(value)}g</Text>
                <Text style={styles.macroLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Insights */}
          {analysis.insights && (
            <View style={styles.insightBox}>
              <Info size={16} color={colors.primary} />
              <Text style={styles.insightText}>{analysis.insights}</Text>
            </View>
          )}

          {/* Warnings */}
          {analysis.warnings?.length > 0 && analysis.warnings.map((w, i) => (
            <View key={i} style={styles.warningBox}>
              <AlertTriangle size={15} color={colors.error} />
              <Text style={styles.warningText}>{w}</Text>
            </View>
          ))}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <View style={styles.suggestionsBlock}>
              <Text style={styles.suggestTitle}>পরামর্শ</Text>
              {analysis.suggestions.map((s, i) => (
                <Text key={i} style={styles.suggestItem}>• {s}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },

  searchContainer: { marginBottom: spacing.lg, zIndex: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  searchInput: { flex: 1, fontFamily: fonts.bn, fontSize: 16, color: colors.textPrimary },

  dropdown: {
    backgroundColor: colors.surface, borderRadius: radius.lg, marginTop: 4,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  dropdownName: { fontFamily: fonts.bn, fontSize: 16, color: colors.textPrimary },
  dropdownRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dropdownCal: { fontFamily: fonts.bnBold, fontSize: 13, color: colors.primary },

  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.md },

  foodRow: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  foodRowDanger: { borderColor: colors.error + '50', backgroundColor: colors.error + '08' },
  foodInfo: { marginBottom: spacing.sm },
  foodNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  foodName: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  foodInsight: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary, marginTop: 4, marginLeft: 22 },
  foodQtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: radius.sm,
    paddingVertical: 6, paddingHorizontal: spacing.sm,
    fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },

  analyzeBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingVertical: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  analyzeBtnDisabled: { opacity: 0.7 },
  analyzeBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },

  emptyHint: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyHintTitle: { fontFamily: fonts.bnBold, fontSize: 20, color: colors.textPrimary },
  emptyHintText: { fontFamily: fonts.bn, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  resultCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
    gap: spacing.md,
  },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  gradeBadge: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  gradeText: { fontFamily: fonts.display, fontSize: 28 },
  resultTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary },
  resultSubtitle: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary },

  macrosRow: { flexDirection: 'row', gap: spacing.sm },
  macroBox: {
    flex: 1, backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  macroValue: { fontFamily: fonts.bnBold, fontSize: 18 },
  macroLabel: { fontFamily: fonts.bn, fontSize: 12, color: colors.textSecondary },

  insightBox: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primary + '12',
    borderRadius: radius.md, padding: spacing.md, alignItems: 'flex-start',
  },
  insightText: { flex: 1, fontFamily: fonts.bn, fontSize: 14, color: colors.textPrimary, lineHeight: 22 },

  warningBox: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.error + '12',
    borderRadius: radius.md, padding: spacing.md, alignItems: 'flex-start',
  },
  warningText: { flex: 1, fontFamily: fonts.bn, fontSize: 14, color: colors.textPrimary, lineHeight: 22 },

  suggestionsBlock: { gap: spacing.sm },
  suggestTitle: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.textPrimary },
  suggestItem: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
