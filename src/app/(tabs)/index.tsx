import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, SectionTitle } from '@/components/ui/screen';
import { Brand } from '@/components/ui/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyChart } from '@/components/progress/weekly-chart';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { workouts } from '@/data/workouts';
import { colors } from '@/constants/fitflow';
import { currentStreak } from '@/utils/progress';

export default function Home() {
  const app = useApp();
  const theme = useFitFlowTheme();
  const recommended =
    workouts.find((item) => item.difficulty === app.user?.experience) ??
    workouts[0];
  const totalMinutes = app.sessions.reduce(
    (sum, item) => sum + item.duration,
    0,
  );
  const calories = app.sessions.reduce((sum, item) => sum + item.calories, 0);
  const today = new Date().toDateString();
  const todayMetrics = app.sessions.reduce(
    (metrics, session) => {
      if (new Date(session.completedAt).toDateString() !== today)
        return metrics;
      return {
        workouts: metrics.workouts + 1,
        calories: metrics.calories + session.calories,
        minutes: metrics.minutes + session.duration,
      };
    },
    { workouts: 0, calories: 0, minutes: 0 },
  );
  const todayDone = todayMetrics.workouts > 0;
  const activeWorkout = getActiveWorkout(app.activeWorkout?.workoutId);

  return (
    <Screen>
      <View style={styles.header}>
        <Brand compact />
        <Pressable
          accessibilityLabel="Open profile"
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {app.user?.name?.[0]?.toUpperCase() ?? 'A'}
          </Text>
        </Pressable>
      </View>
      <View>
        <Text style={[styles.greeting, { color: theme.text }]}>
          Good {greeting()}, {app.user?.name?.split(' ')[0] ?? 'there'}
        </Text>
        <Text style={[styles.sub, { color: theme.muted }]}>
          {todayDone
            ? 'You moved today. Keep the momentum.'
            : "Ready for today's workout?"}
        </Text>
      </View>
      <Card style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View>
            <Text style={[styles.cardLabel, { color: theme.muted }]}>
              TODAY&apos;S PROGRESS
            </Text>
            <Text style={[styles.progressTitle, { color: theme.text }]}>
              {todayDone ? 'Daily goal complete' : 'One session away'}
            </Text>
          </View>
          <View style={styles.ring}>
            <Text style={[styles.ringValue, { color: theme.text }]}>
              {todayDone ? '100' : '0'}%
            </Text>
          </View>
        </View>
        <View style={styles.metrics}>
          <Metric
            icon="barbell-outline"
            value={String(todayMetrics.workouts)}
            label={todayMetrics.workouts === 1 ? 'Workout' : 'Workouts'}
          />
          <Metric
            icon="flame-outline"
            value={String(todayMetrics.calories)}
            label="kcal est."
          />
          <Metric
            icon="time-outline"
            value={String(todayMetrics.minutes)}
            label="Minutes"
          />
          <Metric icon="footsteps-outline" value="—" label="Steps" />
        </View>
        <Text style={[styles.disclaimer, { color: theme.muted }]}>
          Steps require a future Health integration. Calories are workout
          estimates.
        </Text>
      </Card>
      <SectionTitle>Today&apos;s workout</SectionTitle>
      {activeWorkout && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/workouts/active',
              params: { id: activeWorkout.id },
            })
          }
          style={[styles.resume, { backgroundColor: theme.card, borderColor: theme.line }]}
        >
          <Ionicons name="play-circle" size={30} color={colors.accentDark} />
          <View style={styles.resumeCopy}>
            <Text style={[styles.resumeTitle, { color: theme.text }]}>Resume {activeWorkout.name}</Text>
            <Text style={[styles.resumeText, { color: theme.muted }]}>Continue your saved session</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.muted} />
        </Pressable>
      )}
      <LinearGradient colors={['#25382F', '#17211D']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>ADAPTIVE PICK</Text>
          </View>
          <Text style={styles.heroGhost}>MOVE</Text>
        </View>
        <Text style={styles.heroTitle}>{recommended.name}</Text>
        <Text style={styles.heroMeta}>
          {recommended.duration} min · {recommended.difficulty} ·{' '}
          {recommended.exercises.length} exercises
        </Text>
        <Button
          onPress={() =>
            router.push({
              pathname: '/workouts/active',
              params: { id: recommended.id },
            })
          }
          style={styles.heroButton}
        >
          Start Workout
        </Button>
      </LinearGradient>
      <SectionTitle>Quick actions</SectionTitle>
      <View style={styles.quickGrid}>
        {[
          {
            icon: 'play-outline',
            label: 'Start workout',
            href: `/workouts/active?id=${recommended.id}`,
          },
          {
            icon: 'search-outline',
            label: 'Browse workouts',
            href: '/(tabs)/workouts',
          },
          {
            icon: 'stats-chart-outline',
            label: 'Track progress',
            href: '/(tabs)/progress',
          },
          {
            icon: 'calendar-outline',
            label: 'My plan',
            href: '/(tabs)/workouts',
          },
        ].map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(action.href as never)}
            style={[
              styles.quick,
              { backgroundColor: theme.card, borderColor: theme.line },
            ]}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name={action.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={colors.ink}
              />
            </View>
            <Text style={[styles.quickText, { color: theme.text }]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionTitle>Weekly movement</SectionTitle>
      <Card>
        <View style={styles.weekTop}>
          <Text style={[styles.weekBig, { color: theme.text }]}>
            {totalMinutes}
            <Text style={[styles.weekUnit, { color: theme.muted }]}>
              {' '}
              min total
            </Text>
          </Text>
          <Text style={[styles.streak, { color: theme.text }]}>
            {currentStreak(app.sessions)} day streak
          </Text>
        </View>
        {app.sessions.length ? (
          <WeeklyChart sessions={app.sessions} />
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Your week starts here
            </Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Complete a workout to bring this chart to life.
            </Text>
          </View>
        )}
      </Card>
      {calories > 0 && (
        <Text style={[styles.footnote, { color: theme.muted }]}>
          Your completed workouts total an estimated {calories} kcal.
        </Text>
      )}
    </Screen>
  );
}

function getActiveWorkout(id?: string) {
  return id ? workouts.find((workout) => workout.id === id) : undefined;
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

function Metric({
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
    <View style={styles.metric}>
      <Ionicons name={icon} size={18} color={theme.text} />
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.accent, fontWeight: '900' },
  greeting: { fontSize: 30, fontWeight: '900', letterSpacing: -1.2 },
  sub: { fontSize: 16, marginTop: 5 },
  progressCard: { gap: 18 },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  progressTitle: { fontSize: 21, fontWeight: '900', marginTop: 5 },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 8,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { fontSize: 13, fontWeight: '900' },
  metrics: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { alignItems: 'center', gap: 4, flex: 1 },
  metricValue: { fontSize: 17, fontWeight: '900' },
  metricLabel: { fontSize: 10 },
  disclaimer: { fontSize: 10, lineHeight: 14, textAlign: 'center' },
  resume: {
    minHeight: 78,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resumeCopy: { flex: 1, gap: 3 },
  resumeTitle: { fontSize: 15, fontWeight: '900' },
  resumeText: { fontSize: 12 },
  hero: {
    borderRadius: 28,
    padding: 20,
    minHeight: 260,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroTop: { position: 'absolute', top: 18, left: 18, right: 0 },
  heroTag: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    backgroundColor: colors.accent,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  heroTagText: {
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: '900',
    color: colors.ink,
  },
  heroGhost: {
    fontSize: 92,
    fontWeight: '900',
    color: 'rgba(255,255,255,.04)',
    textAlign: 'right',
    marginTop: 4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroMeta: { color: '#B8C4BC', fontSize: 13, marginTop: 6, marginBottom: 18 },
  heroButton: { alignSelf: 'stretch' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quick: {
    width: '48.5%',
    minHeight: 100,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: { fontSize: 14, fontWeight: '800', marginTop: 10 },
  weekTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekBig: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  weekUnit: { fontSize: 14, fontWeight: '600' },
  streak: { fontSize: 13, fontWeight: '700' },
  empty: { paddingVertical: 28, alignItems: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptyText: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  footnote: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
