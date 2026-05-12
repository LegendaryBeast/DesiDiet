/**
 * useHaptics — Thin wrapper around expo-haptics
 * Call the returned functions at key interaction points.
 */
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/settings-store';

export function useHaptics() {
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  // Only fire haptics when the user hasn't disabled notifications
  // (we reuse the same flag as a "system feedback" preference)

  const light = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const medium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const success = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const error = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const warning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return { light, medium, success, error, warning };
}
