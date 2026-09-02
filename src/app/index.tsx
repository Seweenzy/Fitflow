import { Redirect } from 'expo-router';
import { useApp } from '@/store/app-context';
export default function Index() {
  const { onboarded, authenticated } = useApp();
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!authenticated) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={'/(tabs)' as never} />;
}
