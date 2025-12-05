// 테마 색상 정의
export const getColors = (isDark) => ({
  background: isDark ? '#141414' : '#FFFFFF',
  foreground: isDark ? '#FAFAFA' : '#0A0A0A',
  card: isDark ? '#1F1F1F' : '#F5F5F5',
  cardForeground: isDark ? '#FAFAFA' : '#0A0A0A',
  primary: '#6366F1',
  primaryForeground: '#FAFAFA',
  secondary: '#3B82F6',
  muted: isDark ? '#404040' : '#D4D4D4',
  mutedForeground: isDark ? '#B3B3B3' : '#737373',
  accent: '#A78BFA',
  accentForeground: isDark ? '#141414' : '#FAFAFA',
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',
  border: isDark ? '#333333' : '#E5E5E5',
  input: isDark ? '#262626' : '#EFEFEF',
  green: '#10B981',
});