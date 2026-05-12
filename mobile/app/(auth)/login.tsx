import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth-store';
import { authApi, profileApi } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('ফোন নম্বর ও পাসওয়ার্ড দিন');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 1. Login to get token
      const res = await authApi.login(identifier, password);
      const { access_token, refresh_token } = res.data;
      
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      setToken(access_token);

      // 2. Fetch user details
      const meRes = await authApi.me();
      await AsyncStorage.setItem('user', JSON.stringify(meRes.data));
      setUser(meRes.data);

      // 3. Check profile
      try {
        await profileApi.get();
        router.replace('/(tabs)');
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(tabs)'); // Default fallback
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'প্রবেশ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>প্রবেশ করুন</Text>
      <Text style={styles.subtitle}>আপনার খাদক অ্যাকাউন্টে প্রবেশ করুন</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ফোন নম্বর / ইমেইল</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="01XXXXXXXXX"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>পাসওয়ার্ড</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnText}>প্রবেশ করুন</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.footerText}>
          অ্যাকাউন্ট নেই?{' '}
          <Text style={styles.footerLink}>নিবন্ধন করুন</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
  },
  backBtn: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.bnBold,
    fontSize: 36,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.bn,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  error: {
    fontFamily: fonts.bn,
    fontSize: 14,
    color: colors.error,
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.bnBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontFamily: fonts.bnBold,
    fontSize: 18,
    color: colors.white,
  },
  footerText: {
    fontFamily: fonts.bn,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.accent,
    fontFamily: fonts.bnBold,
  },
});
