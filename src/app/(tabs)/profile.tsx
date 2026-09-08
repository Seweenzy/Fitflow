import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { colors } from '@/constants/fitflow';
export default function Profile() {
  const app = useApp();
  const theme = useFitFlowTheme();
  const rows: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    action: () => void;
  }[] = [
    {
      icon: 'flag-outline',
      label: 'My Goals',
      value: app.user?.goals.join(', ') || 'Set goals',
      action: () => router.push('/edit-profile'),
    },
    {
      icon: 'calendar-outline',
      label: 'My Plan',
      value: app.user?.frequency ?? 'Flexible',
      action: () => router.push('/(tabs)/workouts'),
    },
    {
      icon: 'location-outline',
      label: 'Workout Preferences',
      value: app.user?.preference,
      action: () => router.push('/edit-profile'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      value: app.preferences.notifications
        ? app.preferences.reminderTime
        : 'Off',
      action: () => router.push('/settings/notifications'),
    },
    {
      icon: 'options-outline',
      label: 'Units',
      value: app.preferences.units === 'metric' ? 'Metric' : 'Imperial',
      action: () => router.push('/settings' as never),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy',
      action: () =>
        Alert.alert(
            'Privacy',
            'FitFlow stores your profile and workout history in your FitFlow account so your progress can sync across sessions.',
          ),
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      value: 'FitFlow 1.0',
      action: () => router.push('/settings' as never),
    },
  ];
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <Pressable
          accessibilityLabel="Open settings"
          onPress={() => router.push('/settings' as never)}
          style={[styles.settings, { backgroundColor: theme.card }]}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </Pressable>
      </View>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {app.user?.name?.[0]?.toUpperCase() ?? 'A'}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>
          {app.user?.name || 'FitFlow Member'}
        </Text>
        <Text style={[styles.level, { color: theme.muted }]}>
          {app.user?.experience ?? 'Fitness level not set'} ·{' '}
          {app.user?.goals[0] ?? 'Goal not set'}
        </Text>
        <Button
          variant="secondary"
          onPress={() => router.push('/edit-profile')}
          style={styles.edit}
        >
          Edit Profile
        </Button>
      </View>
      <Card style={styles.rows}>
        {rows.map((row, index) => (
          <Pressable
            key={row.label}
            onPress={row.action}
            style={[
              styles.row,
              index < rows.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.line,
              },
            ]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={row.icon} size={20} color={colors.ink} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                {row.label}
              </Text>
              {row.value && (
                <Text
                  numberOfLines={1}
                  style={[styles.rowValue, { color: theme.muted }]}
                >
                  {row.value}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </Pressable>
        ))}
      </Card>
      <Button
        variant="ghost"
        onPress={() =>
          Alert.alert(
            'Sign out?',
            'You can sign back in with your email and password.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign out',
                style: 'destructive',
                onPress: async () => {
                  const result = await app.signOut();
                  if (!result.ok) {
                    return Alert.alert('Unable to sign out', result.error);
                  }
                  router.replace('/(auth)/welcome');
                },
              },
            ],
          )
        }
      >
        Sign Out
      </Button>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1.2 },
  settings: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  avatarText: { fontSize: 38, fontWeight: '900', color: colors.accent },
  name: { fontSize: 25, fontWeight: '900' },
  level: { fontSize: 13, textAlign: 'center' },
  edit: { minHeight: 44, marginTop: 9, paddingHorizontal: 26 },
  rows: { padding: 4 },
  row: {
    flexDirection: 'row',
    minHeight: 66,
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 14, fontWeight: '800' },
  rowValue: { fontSize: 11 },
});
