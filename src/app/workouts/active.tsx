import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { getWorkout, workouts } from '@/data/workouts';
import { colors } from '@/constants/fitflow';
import { useApp } from '@/store/app-context';
import { ActiveWorkout as ActiveWorkoutState } from '@/types/fitflow';
export default function ActiveWorkout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = getWorkout(id);
  const { activeWorkout, setActiveWorkout } = useApp();
  const workoutData = workout ?? workouts[0];
  const stored = workout ? activeWorkout?.workoutId === id ? activeWorkout : null : null;
  const [index, setIndex] = useState(stored?.exerciseIndex ?? 0);
  const [paused, setPaused] = useState(stored?.paused ?? false);
  const [seconds, setSeconds] = useState(stored?.elapsedSeconds ?? 0);
  const [rest, setRest] = useState<number | null>(stored?.restSeconds ?? null);
  const startedAt = useRef(stored?.startedAt ?? new Date().toISOString());
  const exercise = workoutData.exercises[index];
  const progress = useSharedValue((index + 1) / workoutData.exercises.length);
  useEffect(() => {
    progress.value = withTiming((index + 1) / workoutData.exercises.length, {
      duration: 350,
    });
  }, [index, progress, workoutData.exercises.length]);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [paused]);
  useEffect(() => {
    if (rest === null) return;
    const timer = setTimeout(
      () => {
        if (rest <= 1) {
          setRest(null);
          setIndex((value) => value + 1);
        } else {
          setRest(rest - 1);
        }
      },
      1000,
    );
    return () => clearTimeout(timer);
  }, [rest]);
  useEffect(() => {
    const next: ActiveWorkoutState = {
      workoutId: workoutData.id,
      exerciseIndex: index,
      completedExercises: workoutData.exercises
        .slice(0, Math.min(index + 1, workoutData.exercises.length))
        .map((item) => item.id),
      startedAt: startedAt.current,
      elapsedSeconds: seconds,
      paused,
      restSeconds: rest,
    };
    setActiveWorkout(next);
  }, [index, paused, rest, seconds, setActiveWorkout, workoutData]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  if (!workout) {
    return (
      <View style={styles.restScreen}>
        <Text style={styles.restKicker}>WORKOUT NOT FOUND</Text>
      </View>
    );
  }
  const next = () => {
    if (index < workout.exercises.length - 1) return setRest(30);
    Alert.alert('Finish exercise?', 'You are at the end of this routine.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Complete workout',
        onPress: () =>
          router.replace({
            pathname: '/workouts/complete',
            params: {
              id: workout.id,
              duration: String(Math.max(1, Math.round(seconds / 60))),
            },
          }),
      },
    ]);
  };
  if (rest !== null)
    return (
      <View style={styles.restScreen}>
        <Text style={styles.restKicker}>REST</Text>
        <View style={styles.restRing}>
          <Text style={styles.restTime}>
            00:{String(rest).padStart(2, '0')}
          </Text>
          <Text style={styles.restNext}>
            Next: {workout.exercises[index + 1].name}
          </Text>
        </View>
        <Text style={styles.restHint}>
          Breathe slowly. Your next movement is ready when you are.
        </Text>
        <View style={styles.restActions}>
          <Button
            variant="secondary"
            onPress={() => setRest((value) => (value ?? 0) + 15)}
          >
            +15 sec
          </Button>
          <Button
            onPress={() => {
              setRest(null);
              setIndex((value) => value + 1);
            }}
          >
            Skip rest
          </Button>
        </View>
      </View>
    );
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Pressable
          accessibilityLabel="Exit workout"
          onPress={() =>
            Alert.alert(
              'Leave workout?',
              'Your progress in this session will not be saved.',
              [
                { text: 'Keep going', style: 'cancel' },
                {
                  text: 'Leave',
                  style: 'destructive',
                   onPress: () => {
                     setActiveWorkout(null);
                     router.back();
                   },
                },
              ],
            )
          }
        >
          <Ionicons name="close" size={26} color={colors.white} />
        </Pressable>
        <Text style={styles.topTitle}>{workout.name}</Text>
        <Text style={styles.counter}>
          {index + 1}/{workout.exercises.length}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.trackFill, barStyle]} />
      </View>
      <Animated.View
        entering={FadeInRight}
        key={exercise.id}
        style={styles.content}
      >
        <Text style={styles.kicker}>
          EXERCISE {String(index + 1).padStart(2, '0')}
        </Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.prescription}>{exercise.prescription}</Text>
        <View style={styles.visual}>
          <Ionicons name="fitness-outline" size={94} color={colors.accent} />
          <Text style={styles.visualText}>FOCUS</Text>
        </View>
        <Text style={styles.detail}>{exercise.detail}</Text>
      </Animated.View>
      <View style={styles.bottom}>
        <View style={styles.timer}>
          <Ionicons name="time-outline" size={20} color={colors.accent} />
          <Text style={styles.timerText}>
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:
            {String(seconds % 60).padStart(2, '0')}
          </Text>
          <Text style={styles.timerLabel}>session time</Text>
        </View>
        <View style={styles.controls}>
          <Pressable
            accessibilityLabel="Previous exercise"
            disabled={!index}
            onPress={() => setIndex((value) => Math.max(0, value - 1))}
            style={styles.iconButton}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={index ? colors.white : '#526158'}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={paused ? 'Resume workout' : 'Pause workout'}
            onPress={() => setPaused((value) => !value)}
            style={styles.pause}
          >
            <Ionicons
              name={paused ? 'play' : 'pause'}
              size={22}
              color={colors.ink}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Next exercise"
            onPress={next}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-forward" size={23} color={colors.white} />
          </Pressable>
        </View>
        <Button onPress={next} style={styles.next}>
          {index === workout.exercises.length - 1
            ? 'Finish workout'
            : 'Complete exercise'}
        </Button>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingTop: 62,
    paddingBottom: 28,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topTitle: { flex: 1, color: colors.white, fontSize: 15, fontWeight: '800' },
  counter: { color: colors.accent, fontWeight: '900' },
  track: {
    height: 5,
    backgroundColor: '#33433A',
    borderRadius: 5,
    marginTop: 28,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  content: { flex: 1, paddingTop: 42 },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  exerciseName: {
    color: colors.white,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1.6,
    fontWeight: '900',
    marginTop: 8,
  },
  prescription: {
    color: '#B6C1B9',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '700',
  },
  visual: {
    height: 245,
    borderRadius: 30,
    backgroundColor: '#25342C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    overflow: 'hidden',
  },
  visualText: {
    color: 'rgba(255,255,255,.07)',
    fontSize: 86,
    fontWeight: '900',
    position: 'absolute',
    bottom: 8,
    right: -4,
  },
  detail: { color: '#B6C1B9', lineHeight: 23, fontSize: 16, marginTop: 20 },
  bottom: { gap: 16 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerText: { color: colors.white, fontSize: 20, fontWeight: '900' },
  timerLabel: { color: '#7F9085', fontSize: 12 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#25342C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pause: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  next: { marginTop: 1 },
  restScreen: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingHorizontal: 28,
    paddingTop: 90,
    paddingBottom: 40,
    alignItems: 'center',
  },
  restKicker: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 4,
  },
  restRing: {
    marginTop: 70,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 13,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  restTime: {
    color: colors.white,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
  },
  restNext: {
    color: '#9EADA3',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  restHint: {
    color: '#B6C1B9',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 40,
  },
  restActions: { width: '100%', gap: 10, marginTop: 'auto' },
});
