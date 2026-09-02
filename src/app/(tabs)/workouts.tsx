import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, SectionTitle } from '@/components/ui/screen';
import { WorkoutCard } from '@/components/workout/workout-card';
import { Card } from '@/components/ui/card';
import { colors } from '@/constants/fitflow';
import { workouts } from '@/data/workouts';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
const filters = [
  'All',
  'Strength',
  'Cardio',
  'Flexibility',
  'Beginner',
  '20 min',
];
export default function Workouts() {
  const [filter, setFilter] = useState('All');
  const theme = useFitFlowTheme();
  const filtered = useMemo(
    () =>
      workouts.filter(
        (item) =>
          filter === 'All' ||
          item.category === filter ||
          item.difficulty === filter ||
          (filter === '20 min' && item.duration <= 20),
      ),
    [filter],
  );
  return (
    <Screen
      title="Find your flow"
      subtitle="Training that meets you where you are."
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map((item) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: item === filter }}
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filter,
              { borderColor: theme.line },
              item === filter && styles.filterActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: item === filter ? colors.ink : theme.muted },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <SectionTitle
        action={
          <Text style={[styles.result, { color: theme.muted }]}>
            {filtered.length} sessions
          </Text>
        }
      >
        Explore workouts
      </SectionTitle>
      {filtered.length ? (
        filtered.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))
      ) : (
        <Card style={styles.empty}>
          <Ionicons name="search-outline" size={28} color={theme.muted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No workouts match this filter
          </Text>
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            Try another training style to keep moving.
          </Text>
        </Card>
      )}
      <SectionTitle>Build your adaptive plan</SectionTitle>
      <Card style={styles.plan}>
        <View style={styles.planIcon}>
          <Ionicons name="sparkles" size={24} color={colors.ink} />
        </View>
        <View style={styles.planCopy}>
          <Text style={[styles.planTitle, { color: theme.text }]}>
            Your week, made personal
          </Text>
          <Text style={[styles.planText, { color: theme.muted }]}>
            Goal, level and available time shape the plan you see here.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
const styles = StyleSheet.create({
  filters: { gap: 8, paddingVertical: 2 },
  filter: {
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { fontSize: 13, fontWeight: '800' },
  result: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '900' },
  emptyText: { textAlign: 'center', fontSize: 13 },
  plan: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCopy: { flex: 1, gap: 4 },
  planTitle: { fontSize: 16, fontWeight: '900' },
  planText: { fontSize: 13, lineHeight: 19 },
});
