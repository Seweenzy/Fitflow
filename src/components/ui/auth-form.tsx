import { useState } from 'react';
import {
  Alert,
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
import { Screen } from './screen';
import { Button } from './button';
import { Brand } from './brand';
import { colors } from '@/constants/fitflow';
import { useApp } from '@/store/app-context';
export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp, user } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (mode === 'signup' && name.trim().length < 2)
      return setError('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError('Enter a valid email address.');
    if (password.length < 6)
      return setError('Password must be at least 6 characters.');
    const trimmedEmail = email.trim().toLowerCase();
    setSubmitting(true);
    setError('');
    let result;
    try {
      result =
        mode === 'signup'
          ? await signUp(name.trim(), trimmedEmail, password)
          : await signIn(trimmedEmail, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    if (result.error) return setError(result.error);
    if (result.requiresEmailConfirmation) {
      Alert.alert(
        'Check your email',
        'Confirm your email address, then return to sign in.',
        [{ text: 'Go to sign in', onPress: () => router.replace('/(auth)/login') }],
      );
      return;
    }
    router.replace('/(tabs)' as never);
  };
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen style={styles.screen}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Brand />
        <View style={styles.heading}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome back.' : 'Build your momentum.'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to continue your FitFlow plan.'
              : 'Create your account and keep your progress in sync.'}
          </Text>
        </View>
        <View style={styles.fields}>
          {mode === 'signup' && (
            <Field
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="6+ characters"
            secureTextEntry
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {mode === 'login' && (
            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.actions}>
          <Button disabled={submitting} onPress={submit}>
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </Button>
          <Pressable
            onPress={() =>
              router.replace(
                mode === 'login' ? '/(auth)/signup' : '/(auth)/login',
              )
            }
          >
            <Text style={styles.switch}>
              {mode === 'login'
                ? 'New to FitFlow? Create account'
                : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
function Field(
  props: React.ComponentProps<typeof TextInput> & { label: string },
) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        {...props}
        autoCapitalize={
          props.keyboardType === 'email-address' ? 'none' : undefined
        }
        placeholderTextColor="#9AA69E"
        style={styles.input}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, paddingTop: 12 },
  heading: { gap: 8, marginTop: 14 },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -1.5,
  },
  subtitle: { fontSize: 16, lineHeight: 23, color: colors.muted },
  fields: { gap: 14, marginTop: 12 },
  field: { gap: 7 },
  label: { color: colors.ink, fontWeight: '800' },
  input: {
    height: 58,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
  },
  error: { color: '#A7392A', fontWeight: '700' },
  forgot: { textAlign: 'right', fontWeight: '800', color: colors.ink },
  actions: { marginTop: 'auto', gap: 18 },
  switch: { color: colors.ink, fontWeight: '800', textAlign: 'center' },
});
