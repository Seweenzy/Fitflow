import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/fitflow';
import { getWorkout } from '@/data/workouts';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
/* eslint-disable react-hooks/exhaustive-deps */
export default function Complete() {
  const { id, duration } = useLocalSearchParams<{
    id: string;
    duration: string;
  }>();
  const workout = getWorkout(id);
  const { activeWorkout, completeSession, setActiveWorkout } = useApp();
  const theme = useFitFlowTheme();
  const saved = useRef(false);
  const [saving, setSaving] = useState(false);
  const minutes = workout
    ? Math.max(Number(duration) || workout.duration, 1)
    : 1;
  useEffect(() => {
    if (!workout) return;
    if (saved.current) return;
    saved.current = true;
    const now = new Date();
    setSaving(true);
    void completeSession({
      id: `${workout.id}-${now.getTime()}`,
      workoutId: workout.id,
      startedAt:
        activeWorkout?.workoutId === workout.id
          ? activeWorkout.startedAt
          : new Date(now.getTime() - minutes * 60000).toISOString(),
      completedAt: now.toISOString(),
      duration: minutes,
      calories: Math.round(workout.calories * (minutes / workout.duration)),
      completedExercises:
        activeWorkout?.workoutId === workout.id
          ? Math.min(activeWorkout.completedExercises.length, workout.exercises.length)
          : workout.exercises.length,
    }).then((result) => {
      setSaving(false);
      if (!result.ok) {
        saved.current = false;
        Alert.alert('Unable to save workout', result.error);
        return;
      }
      setActiveWorkout(null);
    });
  }, [activeWorkout, completeSession, duration, setActiveWorkout, workout]);
  if (!workout) return null;
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Animated.View entering={ZoomIn.springify()} style={styles.badge}>
        <Ionicons name="checkmark" size={54} color={colors.ink} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(180)} style={styles.copy}>
        <Text style={styles.kicker}>SESSION COMPLETE</Text>
        <Text style={[styles.title, { color: theme.text }]}>Workout complete!</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>You showed up. That's what matters.</Text>
      </Animated.View>
      <View style={styles.stats}>
        <Stat value={`${minutes}`} label="minutes" />
        <Stat value={`${workout.exercises.length}`} label="exercises" />
        <Stat
          value={`${Math.round(workout.calories * (minutes / workout.duration))}`}
          label="kcal est."
        />
      </View>
      <View style={styles.actions}>
        <Button disabled={saving} onPress={() => router.replace('/(tabs)/progress')}>
          {saving ? 'Saving...' : 'View Progress'}
        </Button>
        <Button
          variant="ghost"
          onPress={() => router.replace('/(tabs)' as never)}
        >
          Back Home
        </Button>
      </View>
    </View>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  const theme = useFitFlowTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F9F7',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badge: {
    width: 124,
    height: 124,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  copy: { alignItems: 'center', marginTop: 45, gap: 10 },
  kicker: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  title: {
    color: colors.ink,
    fontSize: 37,
    fontWeight: '900',
    letterSpacing: -1.6,
    textAlign: 'center',
  },
  subtitle: { color: colors.muted, fontSize: 17, textAlign: 'center' },
  stats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 46,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 20,
  },
  stat: { flex: 1, alignItems: 'center' },
  value: { fontSize: 25, fontWeight: '900', color: colors.ink },
  label: { color: colors.muted, fontSize: 11, marginTop: 4 },
  actions: { width: '100%', marginTop: 'auto', gap: 3 },
});
