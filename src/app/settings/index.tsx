import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { colors } from '@/constants/fitflow';
export default function Settings() {
  const app = useApp();
  const theme = useFitFlowTheme();
  const toggleTheme = async () => {
    const result = await app.update({
      preferences: {
        ...app.preferences,
        theme: app.preferences.theme === 'light' ? 'dark' : 'light',
      },
    });
    if (!result.ok) Alert.alert('Unable to save settings', result.error);
  };
  return (
    <Screen>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={styles.spacer} />
      </View>
      <Card style={styles.card}>
        <SettingRow
          icon="notifications-outline"
          label="Workout reminders"
          value={app.preferences.notifications ? 'On' : 'Off'}
          onPress={() => router.push('/settings/notifications')}
          theme={theme}
        />
        <SettingRow
          icon="moon-outline"
          label="Dark mode"
          control={
            <Switch
              value={theme.dark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D9E1DB', true: colors.accentDark }}
              thumbColor={theme.dark ? colors.accent : colors.white}
            />
          }
          theme={theme}
        />
        <SettingRow
          icon="options-outline"
          label="Units"
          value={app.preferences.units === 'metric' ? 'Metric' : 'Imperial'}
           onPress={async () => {
             const result = await app.update({
              preferences: {
                ...app.preferences,
                units:
                  app.preferences.units === 'metric' ? 'imperial' : 'metric',
              },
             });
             if (!result.ok) Alert.alert('Unable to save settings', result.error);
           }}
          theme={theme}
        />
      </Card>
      <Card style={styles.card}>
        <SettingRow
          icon="shield-checkmark-outline"
          label="Privacy"
          onPress={() =>
            Alert.alert(
              'Privacy',
               'FitFlow stores your profile and workout history in your FitFlow account so your progress can sync across sessions.',
            )
          }
          theme={theme}
        />
        <SettingRow
          icon="document-text-outline"
          label="Terms"
          onPress={() =>
            Alert.alert(
              'Terms',
              'Terms will be added before production release.',
            )
          }
          theme={theme}
        />
        <SettingRow
          icon="information-circle-outline"
          label="About FitFlow"
          value="Version 1.0"
          theme={theme}
        />
      </Card>
      <Text style={[styles.note, { color: theme.muted }]}>
         FitFlow syncs account data with Supabase. Apple Health and Google Fit
         integrations are not configured.
      </Text>
    </Screen>
  );
}
function SettingRow({
  icon,
  label,
  value,
  control,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  control?: React.ReactNode;
  onPress?: () => void;
  theme: ReturnType<typeof useFitFlowTheme>;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={19} color={colors.ink} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {control ?? (
        <>
          <Text style={[styles.value, { color: theme.muted }]}>{value}</Text>
          {onPress && (
            <Ionicons name="chevron-forward" size={17} color={theme.muted} />
          )}
        </>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  title: { fontSize: 20, fontWeight: '900' },
  spacer: { width: 24 },
  card: { padding: 4 },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE7',
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 14, fontWeight: '800' },
  value: { fontSize: 12 },
  note: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
