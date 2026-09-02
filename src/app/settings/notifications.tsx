import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { cancelReminders, scheduleReminder } from '@/services/notifications';
import { colors } from '@/constants/fitflow';
export default function NotificationsSettings() {
  const app = useApp();
  const theme = useFitFlowTheme();
  const [time, setTime] = useState(app.preferences.reminderTime);
  const [days, setDays] = useState(app.preferences.workoutDays);
  const [enabled, setEnabled] = useState(app.preferences.notifications);
  const toggleDay = (day: number) =>
    setDays((value) =>
      value.includes(day)
        ? value.filter((item) => item !== day)
        : [...value, day].sort(),
    );
  const save = async () => {
    if (!enabled) {
      await cancelReminders();
      app.disableReminders();
      return router.back();
    }
    if (!days.length) {
      return Alert.alert(
        'Choose a workout day',
        'Select at least one day for your reminders.',
      );
    }
    const result = await scheduleReminder(time, days);
    if (!result.ok) {
      if (result.reason === 'unsupported')
        return Alert.alert(
          'Development build required',
          'Reminders were removed from Expo Go on Android. Install a development build (npx expo run:android) to enable them.',
        );
      return Alert.alert(
        'Notifications need permission',
        'Enable notifications in your device settings to receive workout reminders.',
      );
    }
    app.update({
      preferences: {
        ...app.preferences,
        notifications: true,
        reminderTime: time,
        workoutDays: days,
      },
    });
    router.back();
  };
  return (
    <Screen>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Reminders</Text>
        <View style={styles.spacer} />
      </View>
      <Card style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="notifications-outline" size={27} color={colors.ink} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Keep your rhythm
          </Text>
          <Text style={[styles.heroText, { color: theme.muted }]}>
            We'll remind you on the days you choose. You can change this
            anytime.
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#D9E1DB', true: colors.accentDark }}
          thumbColor={enabled ? colors.accent : colors.white}
        />
      </Card>
      <Text style={[styles.section, { color: theme.text }]}>Reminder time</Text>
      <View style={styles.timeRow}>
        {['06:30', '07:00', '12:30', '18:00'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setTime(item)}
            style={[
              styles.time,
              { borderColor: theme.line },
              time === item && styles.timeActive,
            ]}
          >
            <Text style={[styles.timeText, { color: theme.text }]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.section, { color: theme.text }]}>Workout days</Text>
      <View style={styles.days}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((item, index) => {
          const day = index + 1;
          const active = days.includes(day);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              key={`${item}${index}`}
              onPress={() => toggleDay(day)}
              style={[
                styles.day,
                { borderColor: theme.line },
                active && styles.dayActive,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: active ? colors.ink : theme.muted },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.note, { color: theme.muted }]}>
        Local reminders are scheduled on this device. Push notifications and
        server delivery are not configured in this MVP.
      </Text>
      <Button onPress={save}>Save Reminder</Button>
    </Screen>
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
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 16, fontWeight: '900' },
  heroText: { fontSize: 12, lineHeight: 18 },
  section: { fontSize: 17, fontWeight: '900', marginTop: 4 },
  timeRow: { flexDirection: 'row', gap: 8 },
  time: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  timeText: { fontSize: 13, fontWeight: '800' },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { fontWeight: '900' },
  note: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
