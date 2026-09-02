import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/fitflow';
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row} accessibilityLabel="FitFlow">
      <View style={[styles.mark, compact && styles.markCompact]}>
        <View style={styles.slash} />
        <View style={[styles.slash, styles.slashTwo]} />
      </View>
      {!compact && <Text style={styles.name}>FitFlow</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.ink,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  markCompact: { width: 36, height: 36, borderRadius: 12 },
  slash: {
    height: 7,
    width: 24,
    borderRadius: 5,
    backgroundColor: colors.accent,
    transform: [{ rotate: '-35deg' }],
    marginLeft: 3,
  },
  slashTwo: { marginLeft: 15, marginTop: -3 },
  name: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -1,
    color: colors.ink,
  },
});
