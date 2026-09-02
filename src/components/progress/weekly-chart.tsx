import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { WorkoutSession } from '@/types/fitflow';
import { weeklyMinutes } from '@/utils/progress';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
import { colors } from '@/constants/fitflow';
export function WeeklyChart({ sessions }: { sessions: WorkoutSession[] }) {
  const theme = useFitFlowTheme();
  const data = weeklyMinutes(sessions);
  const max = Math.max(...data.map((day) => day.minutes), 30);
  return (
    <View style={styles.chart}>
      {data.map((day, index) => (
        <View key={index} style={styles.column}>
          <View style={[styles.track, { backgroundColor: theme.line }]}>
            <Animated.View
              entering={FadeInUp.delay(index * 55)}
              style={[
                styles.bar,
                {
                  height: `${Math.max(day.minutes ? 16 : 0, (day.minutes / max) * 100)}%`,
                  backgroundColor: day.minutes ? colors.accent : 'transparent',
                },
              ]}
            />
          </View>
          <Text style={[styles.label, { color: theme.muted }]}>
            {day.label}
          </Text>
          {day.minutes > 0 && <View style={styles.dot} />}
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  chart: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  column: {
    height: '100%',
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  track: {
    width: 10,
    height: 110,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: 8 },
  label: { fontSize: 11, fontWeight: '800' },
  dot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentDark,
  },
});
