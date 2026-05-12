import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  return <Redirect href="/(auth)/onboarding/step-1" />;
}
