import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { getWorkout } from '@/data/workouts';
import { colors } from '@/constants/fitflow';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = getWorkout(id);
  const theme = useFitFlowTheme();
  if (!workout) {
    return (
      <Screen style={styles.screen}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={42} color={theme.muted} />
          <Text style={[styles.heading, { color: theme.text }]}>Workout not found</Text>
          <Text style={[styles.disclaimer, { color: theme.muted }]}>This workout is no longer available.</Text>
        </View>
      </Screen>
    );
  }
  return (
    <Screen scroll style={styles.screen}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </Pressable>
      <LinearGradient colors={['#293D32', '#17211D']} style={styles.cover}>
        <View style={styles.coverIcon}>
          <Ionicons name="barbell-outline" size={40} color={colors.ink} />
        </View>
        <Text style={styles.coverGhost}>{workout.duration}</Text>
        <Text style={styles.coverTitle}>{workout.name}</Text>
        <Text style={styles.coverMeta}>
          {workout.duration} min · {workout.difficulty}
        </Text>
      </LinearGradient>
      <Text style={[styles.title, { color: theme.text }]}>
        {workout.description}
      </Text>
      <View style={styles.stats}>
        <Stat label="Est. calories" value={`${workout.calories}`} />
        <Stat label="Exercises" value={`${workout.exercises.length}`} />
        <Stat label="Equipment" value={workout.equipment} />
      </View>
      <Text style={[styles.heading, { color: theme.text }]}>
        In this workout
      </Text>
      <View style={styles.list}>
        {workout.exercises.map((exercise, index) => (
          <View
            key={exercise.id}
            style={[styles.exercise, { borderColor: theme.line }]}
          >
            <Text style={styles.number}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <View style={styles.exerciseCopy}>
              <Text style={[styles.exerciseName, { color: theme.text }]}>
                {exercise.name}
              </Text>
              <Text style={[styles.prescription, { color: theme.muted }]}>
                {exercise.prescription}
              </Text>
            </View>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={theme.line}
            />
          </View>
        ))}
      </View>
      <Button
        onPress={() =>
          router.push({
            pathname: '/workouts/active',
            params: { id: workout.id },
          })
        }
      >
        Start Workout
      </Button>
      <Text style={[styles.disclaimer, { color: theme.muted }]}>
        Calories are estimates for motivation, not medical measurements.
      </Text>
    </Screen>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { paddingTop: 12, gap: 20 },
  cover: {
    height: 250,
    borderRadius: 30,
    padding: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  coverIcon: {
    position: 'absolute',
    top: 25,
    left: 24,
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGhost: {
    position: 'absolute',
    right: 8,
    top: 5,
    fontSize: 150,
    fontWeight: '900',
    color: 'rgba(255,255,255,.05)',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: colors.white,
  },
  coverMeta: { marginTop: 7, fontSize: 14, color: '#B8C4BC' },
  title: { fontSize: 17, lineHeight: 25, fontWeight: '700' },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 22,
    padding: 16,
  },
  stat: {
    flex: 1,
    gap: 4,
    borderRightWidth: 1,
    borderColor: 'rgba(23,33,29,.15)',
    paddingLeft: 10,
  },
  statValue: { fontSize: 17, fontWeight: '900', color: colors.ink },
  statLabel: { fontSize: 10, color: colors.ink, opacity: 0.65 },
  heading: { fontSize: 21, fontWeight: '900' },
  list: { gap: 8 },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 13,
  },
  number: { fontSize: 12, color: colors.accentDark, fontWeight: '900' },
  exerciseCopy: { flex: 1, gap: 4 },
  exerciseName: { fontSize: 16, fontWeight: '900' },
  prescription: { fontSize: 13 },
  disclaimer: { fontSize: 11, textAlign: 'center', marginTop: -8 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
});
