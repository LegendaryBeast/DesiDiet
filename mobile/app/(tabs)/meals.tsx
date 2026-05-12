import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { CalendarDays, ChefHat, PenLine } from 'lucide-react-native';
import MealPlanView from '../../components/meals/MealPlanView';
import MealBuilderView from '../../components/meals/MealBuilderView';
import MealTrackerView from '../../components/meals/MealTrackerView';

type TabId = 'plan' | 'builder' | 'tracker';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'plan', label: 'পরিকল্পনা', icon: CalendarDays },
  { id: 'builder', label: 'প্রস্তুতকারক', icon: ChefHat },
  { id: 'tracker', label: 'ট্র্যাকার', icon: PenLine },
];

export default function MealsScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('plan');
  const [builderPreFill, setBuilderPreFill] = useState<string[] | null>(null);
  const router = useRouter();

  // Called from MealPlanView when user taps "Swap" on a slot
  const handleSwapRequest = (items: string[]) => {
    setBuilderPreFill(items);
    setActiveTab('builder');
  };

  // Called from MealPlanView empty state — navigates to Chat tab with pre-fill
  const handleChatRequest = (preMessage: string) => {
    router.push({ pathname: '/(tabs)/chat', params: { prefill: preMessage } });
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>খাবার</Text>
        <View style={styles.tabBar}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(id)}
                activeOpacity={0.8}
              >
                <Icon
                  size={16}
                  color={isActive ? colors.primary : colors.textSecondary}
                  strokeWidth={2}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sub-views */}
      {activeTab === 'plan' && (
        <MealPlanView
          onSwapRequest={handleSwapRequest}
          onChatRequest={handleChatRequest}
        />
      )}
      {activeTab === 'builder' && (
        <MealBuilderView
          preFillItems={builderPreFill}
          onClearPreFill={() => setBuilderPreFill(null)}
        />
      )}
      {activeTab === 'tracker' && <MealTrackerView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    fontFamily: fonts.bnBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  tabText: {
    fontFamily: fonts.bnBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
});
