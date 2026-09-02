import { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/constants/fitflow';
import { getSupabaseClient } from '@/services/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (password.length < 8) {
      return Alert.alert(
        'Choose a stronger password',
        'Use at least 8 characters.',
      );
    }
    setSubmitting(true);
    const { error } = await getSupabaseClient().auth.updateUser({ password });
    setSubmitting(false);
    if (error) return Alert.alert('Unable to update password', error.message);
    Alert.alert('Password updated', 'You can now continue using FitFlow.', [
      { text: 'Continue', onPress: () => router.replace('/(tabs)' as never) },
    ]);
  };

  return (
    <Screen
      title="Create a new password"
      subtitle="Choose a new password with at least 8 characters."
    >
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="New password"
        placeholderTextColor="#9AA69E"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Button disabled={submitting} onPress={submit}>
        {submitting ? 'Updating...' : 'Update Password'}
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
