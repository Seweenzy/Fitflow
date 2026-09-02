import { useApp } from '@/store/app-context';
import { colors } from '@/constants/fitflow';
export function useFitFlowTheme() {
  const { preferences } = useApp();
  const dark = preferences.theme === 'dark';
  return {
    dark,
    background: dark ? colors.darkCanvas : colors.canvas,
    card: dark ? colors.darkCard : colors.card,
    text: dark ? '#F4F7F4' : colors.ink,
    muted: dark ? '#9BA99F' : colors.muted,
    line: dark ? colors.darkLine : colors.line,
    accent: colors.accent,
  };
}
