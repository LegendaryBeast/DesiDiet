import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { profileApi } from '../../lib/api';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { Leaf, Sparkles } from 'lucide-react-native';
import { Animated, FadeInUp } from '../../lib/animated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && accessToken) {
      profileApi.get()
        .then(() => router.replace('/(tabs)'))
        .catch((e: any) => {
          if (e.response?.status === 404) {
            router.replace('/(auth)/onboarding');
          } else {
            router.replace('/(tabs)');
          }
        });
    }
  }, [isLoading, accessToken]);

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Animated.View entering={FadeInUp.delay(100).duration(700)}>
          <View style={styles.logoCircle}>
            <Leaf size={52} color={colors.primary} strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(300).duration(700)} style={styles.appName}>
          পুষ্টি এআই
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(450).duration(700)} style={styles.tagline}>
          আপনার ব্যক্তিগত পুষ্টি সহায়ক
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(600).duration(700)} style={styles.pillBadge}>
          <Sparkles size={14} color={colors.accent} />
          <Text style={styles.pillBadgeText}>Powered by AI · Made for Bangladesh</Text>
        </Animated.View>
      </View>

      {/* Feature bullets */}
      <Animated.View entering={FadeInUp.delay(700).duration(700)} style={styles.features}>
        {[
          '🥗 এআই-নির্ধারিত দৈনিক খাদ্যতালিকা',
          '📊 ব্যক্তিগত ক্যালরি ও পুষ্টি বিশ্লেষণ',
          '💬 যেকোনো পুষ্টি প্রশ্নে চ্যাটবট',
          '💊 ওষুধের সময়সূচী ব্যবস্থাপনা',
        ].map((f, i) => (
          <Text key={i} style={styles.featureItem}>{f}</Text>
        ))}
      </Animated.View>

      {/* CTA Buttons */}
      <Animated.View entering={FadeInUp.delay(900).duration(700)} style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryBtnText}>শুরু করুন</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryBtnText}>ইতিমধ্যে অ্যাকাউন্ট আছে? প্রবেশ করুন</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.primary + '20',
    borderWidth: 2, borderColor: colors.primary + '40',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontFamily: fonts.bnBold,
    fontSize: 48,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: fonts.bn,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  pillBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: spacing.md,
    backgroundColor: colors.accent + '18',
    borderRadius: radius.pill,
    paddingVertical: 6, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.accent + '30',
  },
  pillBadgeText: {
    fontFamily: fonts.body, fontSize: 12,
    color: colors.accent, letterSpacing: 0.5,
  },
  features: {
    width: '100%', gap: spacing.sm,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  featureItem: { fontFamily: fonts.bn, fontSize: 15, color: colors.textPrimary, lineHeight: 26 },
  buttons: { width: '100%', gap: spacing.md },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill, alignItems: 'center',
  },
  primaryBtnText: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.white },
  secondaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  secondaryBtnText: { fontFamily: fonts.bnBold, fontSize: 15, color: colors.textSecondary },
});
