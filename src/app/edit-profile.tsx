import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/app-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
export default function EditProfile() {
  const app = useApp();
  const theme = useFitFlowTheme();
  const [name, setName] = useState(app.user?.name ?? '');
  const [age, setAge] = useState(app.user?.age ?? '');
  const [height, setHeight] = useState(app.user?.height ?? '');
  const [weight, setWeight] = useState(app.user?.weight ?? '');
  const save = () => {
    if (name.trim().length < 2)
      return Alert.alert(
        'Check your name',
        'Please enter at least 2 characters.',
      );
    if (!app.user) return;
    app.update({
      user: { ...app.user, name: name.trim(), age, height, weight },
    });
    router.back();
  };
  return (
    <Screen>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Edit profile</Text>
        <View style={styles.spacer} />
      </View>
      <Field label="Name" value={name} onChangeText={setName} theme={theme} />
      <Field
        label="Age"
        value={age}
        onChangeText={setAge}
        theme={theme}
        numeric
      />
      <Field
        label={`Height (${app.preferences.units === 'metric' ? 'cm' : 'in'})`}
        value={height}
        onChangeText={setHeight}
        theme={theme}
        numeric
      />
      <Field
        label={`Weight (${app.preferences.units === 'metric' ? 'kg' : 'lb'})`}
        value={weight}
        onChangeText={setWeight}
        theme={theme}
        numeric
      />
      <Button onPress={save}>Save Changes</Button>
    </Screen>
  );
}
function Field({
  label,
  value,
  onChangeText,
  theme,
  numeric,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  theme: ReturnType<typeof useFitFlowTheme>;
  numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        keyboardType={numeric ? 'numeric' : 'default'}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.card,
            borderColor: theme.line,
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  title: { fontSize: 20, fontWeight: '900' },
  spacer: { width: 24 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '800' },
  input: {
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
