/**
 * SkeletonLoader — shimmer placeholder for loading states
 * Uses Reanimated loop animation for the shimmer effect.
 */
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, radius, spacing } from '../lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = radius.sm, style }: SkeletonBoxProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmer.value * 0.35,
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: colors.surfaceLight },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ── Pre-built skeleton layouts ────────────────────────────────────────────────
export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.headerSkel}>
        <SkeletonBox width={200} height={30} borderRadius={radius.md} />
        <SkeletonBox width={160} height={18} borderRadius={radius.sm} style={{ marginTop: 8 }} />
      </View>
      {/* Ring card */}
      <View style={styles.cardSkel}>
        <SkeletonBox width={160} height={160} borderRadius={80} style={{ alignSelf: 'center' }} />
        <View style={styles.macroRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.macroColSkel}>
              <SkeletonBox width={48} height={20} />
              <SkeletonBox width={40} height={12} style={{ marginTop: 4 }} />
              <SkeletonBox width='100%' height={4} borderRadius={2} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      </View>
      {/* Meal cards */}
      <View style={styles.row}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.mealCardSkel}>
            <SkeletonBox width={80} height={18} style={{ marginBottom: 8 }} />
            <SkeletonBox width='90%' height={14} style={{ marginBottom: 4 }} />
            <SkeletonBox width={60} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function MealPlanSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.cardSkelMeal}>
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width={120} height={18} />
            <SkeletonBox width='80%' height={14} />
            <SkeletonBox width={60} height={14} />
          </View>
          <SkeletonBox width={32} height={32} borderRadius={16} />
        </View>
      ))}
    </View>
  );
}

export function ChatSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.msgSkel, i % 2 === 0 ? styles.msgLeft : styles.msgRight]}>
          <SkeletonBox
            width={i % 2 === 0 ? SCREEN_W * 0.65 : SCREEN_W * 0.5}
            height={i === 0 ? 70 : 44}
            borderRadius={radius.lg}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  headerSkel: { marginBottom: spacing.md },
  cardSkel: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.xl,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  macroRow: { flexDirection: 'row', gap: spacing.md },
  macroColSkel: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', gap: spacing.md },
  mealCardSkel: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardSkelMeal: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  msgSkel: { marginBottom: spacing.md },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
});
