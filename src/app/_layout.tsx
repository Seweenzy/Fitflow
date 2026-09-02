import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppProvider, useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { Button } from '@/components/ui/button';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 350, fade: true });
function Navigation() {
  const { initializationError, ready, retryInitialization } = useApp();
  const theme = useFitFlowTheme();
  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);
  if (!ready) return null;
  if (initializationError) {
    return (
      <View style={[styles.errorScreen, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorTitle, { color: theme.text }]}>Connection problem</Text>
        <Text style={[styles.errorText, { color: theme.muted }]}>
          {initializationError}
        </Text>
        <Button onPress={retryInitialization}>Try Again</Button>
      </View>
    );
  }
  return (
    <ThemeProvider value={theme.dark ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workouts/[id]" />
        <Stack.Screen
          name="workouts/active"
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="workouts/complete"
          options={{ gestureEnabled: false, animation: 'fade_from_bottom' }}
        />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="reset-password" options={{ gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  errorTitle: { fontSize: 30, fontWeight: '900' },
  errorText: { fontSize: 16, lineHeight: 23 },
});
export default function RootLayout() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
