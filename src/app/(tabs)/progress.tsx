import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, SectionTitle } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { WeeklyChart } from '@/components/progress/weekly-chart';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { currentStreak, formatDate, weeklyMinutes } from '@/utils/progress';
import { getWorkout } from '@/data/workouts';
import { colors } from '@/constants/fitflow';
export default function Progress() {
  const { sessions } = useApp();
  const theme = useFitFlowTheme();
  const minutes = sessions.reduce((sum, item) => sum + item.duration, 0);
  const calories = sessions.reduce((sum, item) => sum + item.calories, 0);
  const streak = currentStreak(sessions);
  const week = weeklyMinutes(sessions);
  return (
    <Screen title="Your progress" subtitle="Proof that consistency adds up.">
      <View style={styles.grid}>
        <Summary
          icon="barbell-outline"
          value={`${sessions.length}`}
          label="Workouts"
        />
        <Summary icon="time-outline" value={`${minutes}`} label="Minutes" />
        <Summary icon="flame-outline" value={`${streak}`} label="Day streak" />
        <Summary icon="flash-outline" value={`${calories}`} label="kcal est." />
      </View>
      <SectionTitle>This week</SectionTitle>
      <Card>
        {sessions.length ? (
          <>
            <WeeklyChart sessions={sessions} />
            <Text style={[styles.chartCaption, { color: theme.muted }]}>
              {week.reduce((sum, day) => sum + day.minutes, 0)} minutes logged
              this week
            </Text>
          </>
        ) : (
          <Empty
            icon="stats-chart-outline"
            title="Your progress starts with one session"
            text="Complete your first workout to start tracking your progress."
          />
        )}
      </Card>
      <SectionTitle>Consistency</SectionTitle>
      <Card>
        <View style={styles.calendar}>
          {week.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={[
                  styles.dayCircle,
                  { backgroundColor: day.minutes ? colors.accent : theme.line },
                ]}
              >
                {day.minutes ? (
                  <Ionicons name="checkmark" size={16} color={colors.ink} />
                ) : null}
              </View>
              <Text style={[styles.dayLabel, { color: theme.muted }]}>
                {day.label}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[styles.consistency, { color: theme.text }]}>
          {streak
            ? `${streak} day streak. Keep your rhythm.`
            : 'Complete workouts on consecutive days to build a streak.'}
        </Text>
      </Card>
      <SectionTitle>Workout history</SectionTitle>
      {sessions.length ? (
        sessions.map((session) => {
          const workout = getWorkout(session.workoutId);
          if (!workout) return null;
          return (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/workouts/[id]',
                  params: { id: workout.id },
                })
              }
            >
              <Card style={styles.history}>
                <View
                  style={[
                    styles.historyIcon,
                    { backgroundColor: workout.accent },
                  ]}
                >
                  <Ionicons name="checkmark" size={20} color={colors.ink} />
                </View>
                <View style={styles.historyCopy}>
                  <Text style={[styles.historyTitle, { color: theme.text }]}>
                    {workout.name}
                  </Text>
                  <Text style={[styles.historyMeta, { color: theme.muted }]}>
                    {formatDate(session.completedAt)} · {session.duration} min ·{' '}
                    {workout.difficulty}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.muted}
                />
              </Card>
            </Pressable>
          );
        })
      ) : (
        <Card>
          <Empty
            icon="time-outline"
            title="No workout history yet"
            text="Your workout history will appear here after your first workout."
          />
        </Card>
      )}
    </Screen>
  );
}
function Summary({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  const theme = useFitFlowTheme();
  return (
    <Card style={styles.summary}>
      <Ionicons name={icon} size={21} color={colors.accentDark} />
      <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: theme.muted }]}>{label}</Text>
    </Card>
  );
}
function Empty({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  const theme = useFitFlowTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={30} color={theme.muted} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: theme.muted }]}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summary: {
    width: '48.5%',
    minHeight: 125,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  summaryValue: { fontSize: 27, fontWeight: '900' },
  summaryLabel: { fontSize: 12, fontWeight: '700' },
  chartCaption: { textAlign: 'center', fontSize: 12, marginTop: 8 },
  empty: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '900', textAlign: 'center' },
  emptyText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  calendar: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 8 },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: { fontSize: 11, fontWeight: '800' },
  consistency: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '700',
  },
  history: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    borderRadius: 20,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCopy: { flex: 1, gap: 4 },
  historyTitle: { fontSize: 15, fontWeight: '900' },
  historyMeta: { fontSize: 11 },
});
