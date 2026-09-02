import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '@/constants/fitflow';
export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: PropsWithChildren<{
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, variant !== 'primary' && styles.darkLabel]}>
        {children}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: '#EEF2EE' },
  ghost: { backgroundColor: 'transparent' },
  label: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  darkLabel: { color: colors.ink },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
