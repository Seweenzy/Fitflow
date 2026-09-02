import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Workout } from '@/types/fitflow';
import { Card } from '@/components/ui/card';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
export function WorkoutCard({ workout }: { workout: Workout }) {
  const theme = useFitFlowTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${workout.name}`}
      onPress={() =>
        router.push({ pathname: '/workouts/[id]', params: { id: workout.id } })
      }
    >
      <Card style={styles.card}>
        <View style={[styles.art, { backgroundColor: workout.accent }]}>
          <Ionicons name="barbell-outline" size={28} color="#17211D" />
          <Text style={styles.artNumber}>
            {String(workout.duration).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.body}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
            {workout.name}
          </Text>
          <Text style={[styles.meta, { color: theme.muted }]}>
            {workout.duration} min · {workout.difficulty}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.muscles, { color: theme.text }]}
          >
            {workout.targetMuscles.join(' · ')}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.equipment, { color: theme.muted }]}>
              {workout.equipment}
            </Text>
            <View style={styles.arrow}>
              <Ionicons name="arrow-forward" size={17} color="#17211D" />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 12, gap: 15 },
  art: {
    width: 98,
    minHeight: 128,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
  },
  artNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#17211D',
    opacity: 0.28,
  },
  body: { flex: 1, paddingVertical: 4, gap: 6 },
  title: { fontSize: 18, fontWeight: '900' },
  meta: { fontSize: 13, fontWeight: '600' },
  muscles: { fontSize: 13, fontWeight: '700' },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  equipment: { fontSize: 12 },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#C8F169',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
