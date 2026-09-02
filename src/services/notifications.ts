import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

export type ScheduleReminderResult = {
  ok: boolean;
  reason?: 'permission' | 'unsupported';
};
async function getNotifications() {
  if (Platform.OS === 'android' && isRunningInExpoGo()) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

export async function scheduleReminder(
  time: string,
  days: number[],
): Promise<ScheduleReminderResult> {
  const Notifications = await getNotifications();
  if (!Notifications) return { ok: false, reason: 'unsupported' };
  const [hour, minute] = time.split(':').map(Number);
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('workout-reminders', {
      name: 'Workout reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const permission = await Notifications.requestPermissionsAsync();
  if (
    !permission.granted &&
    permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return { ok: false, reason: 'permission' };
  }
  await cancelReminders();
  for (const weekday of days) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your FitFlow session is waiting',
        body: 'A little movement can change the shape of your day.',
        data: { url: '/(tabs)/workouts' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
  }
  return { ok: true };
}
export async function cancelReminders() {
  const Notifications = await getNotifications();
  if (Notifications) await Notifications.cancelAllScheduledNotificationsAsync();
}
