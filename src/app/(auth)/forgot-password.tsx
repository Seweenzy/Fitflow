import { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/fitflow';
import { getSupabaseClient } from '@/services/supabase';
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail))
      return Alert.alert('Check your email', 'Enter a valid email address.');
    setSubmitting(true);
    let error;
    try {
      ({ error } = await getSupabaseClient().auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: Linking.createURL('/reset-password') },
      ));
    } catch (caught) {
      setSubmitting(false);
      return Alert.alert(
        'Unable to reset password',
        caught instanceof Error ? caught.message : 'Please try again.',
      );
    }
    setSubmitting(false);
    if (error) return Alert.alert('Unable to reset password', error.message);
    Alert.alert(
      'Check your email',
      'Open the password reset link we sent to continue.',
      [{ text: 'Back to sign in', onPress: () => router.back() }],
    );
  };
  return (
    <Screen
      title="Reset password"
      subtitle="Enter your email and we'll send you a secure password reset link."
    >
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        placeholderTextColor="#9AA69E"
        style={styles.input}
      />
      <Button
        disabled={submitting}
        onPress={submit}
      >
        {submitting ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </Screen>
  );
}
const styles = StyleSheet.create({
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
});
