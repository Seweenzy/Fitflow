import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/screen';
import { Brand } from '@/components/ui/brand';
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/fitflow';
export default function Welcome() {
  return (
    <Screen style={styles.screen}>
      <Brand />
      <View style={styles.visual}>
        <View style={styles.circle}>
          <Ionicons name="fitness" size={66} color={colors.ink} />
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>START WHERE YOU ARE</Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Your strongest days start here.</Text>
        <Text style={styles.subtitle}>
          Sign in to keep your plan, history and momentum together.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button onPress={() => router.push('/(auth)/signup')}>
          Create Account
        </Button>
        <Button
          variant="secondary"
          onPress={() => router.push('/(auth)/login')}
        >
          I already have an account
        </Button>
        <Text style={styles.note}>
          Development mode uses secure local app state. No backend is connected
          yet.
        </Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 18, justifyContent: 'space-between' },
  visual: {
    height: 270,
    borderRadius: 34,
    backgroundColor: '#E7EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle: {
    width: 165,
    height: 165,
    borderRadius: 83,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    position: 'absolute',
    bottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.ink,
  },
  tagText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  copy: { gap: 12 },
  title: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.8,
    color: colors.ink,
  },
  subtitle: { fontSize: 17, lineHeight: 24, color: colors.muted },
  actions: { gap: 10 },
  note: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    color: colors.muted,
    paddingHorizontal: 20,
  },
});
