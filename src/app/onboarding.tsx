import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/components/ui/brand';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/constants/fitflow';
import { useApp } from '@/store/app-context';
import { Experience, Goal, Preference, User } from '@/types/fitflow';

const goals: Goal[] = [
  'Lose weight',
  'Build muscle',
  'Improve fitness',
  'Increase strength',
  'Improve flexibility',
  'Stay active',
];
const experience: Experience[] = ['Beginner', 'Intermediate', 'Advanced'];
const places: Preference[] = ['Home', 'Gym', 'Outdoor', 'Anywhere'];
const frequency = ['2 days', '3 days', '4 days', '5 days', '6+ days'];
export default function Onboarding() {
  const { update } = useApp();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<User>({
    name: '',
    email: '',
    goals: [],
  });
  const next = () => setStep((value) => Math.min(6, value + 1));
  const finish = () => {
    update({ user: profile, onboarded: true });
    router.replace('/(auth)/welcome');
  };
  const toggleGoal = (goal: Goal) =>
    setProfile((current) => ({
      ...current,
      goals: current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal],
    }));
  const content = [
    <View style={styles.welcome} key="welcome">
      <Brand />
      <View style={styles.heroArt}>
        <View style={styles.orbit}>
          <Ionicons name="flash" size={54} color={colors.ink} />
        </View>
        <Text style={styles.heroNumber}>01</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>YOUR ROUTINE, IN FLOW</Text>
        <Text style={styles.display}>Move better.{`\n`}Feel stronger.</Text>
        <Text style={styles.lead}>
          Build stronger habits with training that fits your life.
        </Text>
      </View>
    </View>,
    <Choice
      key="goal"
      title="What is your main goal?"
      subtitle="Choose everything that matters to you."
      options={goals}
      selected={profile.goals}
      onSelect={(item) => toggleGoal(item as Goal)}
      multi
    />,
    <Choice
      key="experience"
      title="What's your fitness experience?"
      subtitle="We'll set the right pace from day one."
      options={experience}
      selected={profile.experience ? [profile.experience] : []}
      onSelect={(item) =>
        setProfile({ ...profile, experience: item as Experience })
      }
    />,
    <Choice
      key="place"
      title="How do you like to train?"
      subtitle="Your plan will prioritize this training environment."
      options={places}
      selected={profile.preference ? [profile.preference] : []}
      onSelect={(item) =>
        setProfile({ ...profile, preference: item as Preference })
      }
    />,
    <Choice
      key="frequency"
      title="How often do you want to work out?"
      subtitle="Consistency beats intensity. Pick a realistic rhythm."
      options={frequency}
      selected={profile.frequency ? [profile.frequency] : []}
      onSelect={(item) => setProfile({ ...profile, frequency: item })}
    />,
    <View key="personal" style={styles.form}>
      <Text style={styles.stepTitle}>A little about you</Text>
      <Text style={styles.stepSubtitle}>
        This helps personalize your plan. All fields are optional.
      </Text>
      <View style={styles.inputRow}>
        <Input
          label="Age"
          value={profile.age}
          onChangeText={(age) => setProfile({ ...profile, age })}
        />
        <Input
          label="Height (cm)"
          value={profile.height}
          onChangeText={(height) => setProfile({ ...profile, height })}
        />
      </View>
      <Input
        label="Weight (kg)"
        value={profile.weight}
        onChangeText={(weight) => setProfile({ ...profile, weight })}
      />
      <Input
        label="Gender (optional)"
        value={profile.gender}
        onChangeText={(gender) => setProfile({ ...profile, gender })}
      />
    </View>,
    <View key="ready" style={styles.ready}>
      <View style={styles.readyMark}>
        <Ionicons name="checkmark" size={46} color={colors.ink} />
      </View>
      <Text style={styles.stepTitle}>
        You're ready to build your fitness routine.
      </Text>
      <Text style={styles.stepSubtitle}>
        Your first adaptive plan will focus on{' '}
        {profile.goals[0]?.toLowerCase() ?? 'moving consistently'} with{' '}
        {profile.frequency ?? 'a flexible schedule'}.
      </Text>
      <View style={styles.planLine}>
        <Ionicons name="sparkles" size={20} color={colors.ink} />
        <Text style={styles.planText}>
          Your plan adapts to your goal, level and available time.
        </Text>
      </View>
    </View>,
  ];
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll={step === 5} style={styles.screen}>
        <View style={styles.top}>
          {step > 0 && (
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => setStep(step - 1)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          )}
          <View style={styles.progress}>
            {Array.from({ length: 7 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  index <= step && styles.progressActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.count}>{step + 1}/7</Text>
        </View>
        {content[step]}
        <Button
          disabled={
            (step === 1 && !profile.goals.length) ||
            (step === 2 && !profile.experience) ||
            (step === 3 && !profile.preference) ||
            (step === 4 && !profile.frequency)
          }
          onPress={step === 6 ? finish : next}
        >
          {step === 0
            ? 'Get Started'
            : step === 6
              ? 'Create My Plan'
              : 'Continue'}
        </Button>
      </Screen>
    </KeyboardAvoidingView>
  );
}
function Choice({
  title,
  subtitle,
  options,
  selected,
  onSelect,
  multi,
}: {
  title: string;
  subtitle: string;
  options: readonly string[];
  selected: string[];
  onSelect: (item: string) => void;
  multi?: boolean;
}) {
  return (
    <View style={styles.choice}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSubtitle}>{subtitle}</Text>
      <View style={styles.options}>
        {options.map((option, index) => {
          const active = selected.includes(option);
          return (
            <Pressable
              accessibilityRole={multi ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: active }}
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.option, active && styles.optionActive]}
            >
              <View
                style={[styles.optionIcon, active && styles.optionIconActive]}
              >
                <Text style={styles.optionIndex}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <Text style={styles.optionText}>{option}</Text>
              <Ionicons
                name={active ? 'checkmark-circle' : 'ellipse-outline'}
                size={23}
                color={active ? colors.ink : '#C3CCC5'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
function Input({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType={label.includes('Gender') ? 'default' : 'numeric'}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder="Skip"
        placeholderTextColor="#A1ADA5"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  top: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 14 },
  progress: { flex: 1, flexDirection: 'row', gap: 4 },
  progressBar: {
    height: 4,
    borderRadius: 4,
    flex: 1,
    backgroundColor: '#E2E8E3',
  },
  progressActive: { backgroundColor: colors.ink },
  count: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  welcome: { flex: 1, paddingTop: 16, gap: 28 },
  heroArt: {
    height: 250,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbit: {
    width: 144,
    height: 144,
    borderWidth: 20,
    borderColor: 'rgba(23,33,29,.12)',
    borderRadius: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNumber: {
    position: 'absolute',
    bottom: -24,
    right: 10,
    fontSize: 110,
    fontWeight: '900',
    color: 'rgba(23,33,29,.10)',
  },
  copy: { gap: 10 },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '900',
    color: colors.muted,
  },
  display: {
    fontSize: 43,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -2.2,
    color: colors.ink,
  },
  lead: { fontSize: 17, lineHeight: 25, color: colors.muted },
  choice: { flex: 1, paddingTop: 28 },
  stepTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: colors.ink,
  },
  stepSubtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.muted,
    marginTop: 8,
  },
  options: { marginTop: 26, gap: 10 },
  option: {
    minHeight: 66,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 13,
  },
  optionActive: { borderColor: colors.ink, backgroundColor: '#F1F8E3' },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: { backgroundColor: colors.accent },
  optionIndex: { fontSize: 12, fontWeight: '900', color: colors.ink },
  optionText: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.ink },
  form: { flex: 1, paddingTop: 28, gap: 16 },
  inputRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  inputWrap: { flex: 1, gap: 7 },
  inputLabel: { color: colors.ink, fontWeight: '800' },
  input: {
    height: 58,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  ready: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: 16,
  },
  readyMark: {
    width: 100,
    height: 100,
    borderRadius: 34,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    transform: [{ rotate: '-6deg' }],
  },
  planLine: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#EFF3EF',
    padding: 16,
    borderRadius: 18,
    marginTop: 15,
  },
  planText: { flex: 1, lineHeight: 20, color: colors.ink, fontWeight: '700' },
});
