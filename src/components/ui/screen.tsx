import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFitFlowTheme } from '@/hooks/use-fitflow-theme';
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  style,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  style?: ViewStyle;
}>) {
  const theme = useFitFlowTheme();
  const content = (
    <View style={[styles.content, style]}>
      {title && (
        <View style={styles.heading}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  const theme = useFitFlowTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {children}
      </Text>
      {action}
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },
  content: { paddingHorizontal: 20, gap: 22 },
  heading: { paddingTop: 12, gap: 6 },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  subtitle: { fontSize: 16, lineHeight: 23 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
});
