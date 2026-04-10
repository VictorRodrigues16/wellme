import type { ViewStyle } from 'react-native';

export const colors = {
  // Backgrounds
  background: '#0F1B2D',
  backgroundSecondary: '#1A2B45',
  surface: '#243B5C',

  // Primary green
  primary: '#58CC02',
  primaryDark: '#46A302',
  primaryLight: '#7ED321',

  // Yellow / XP
  gold: '#FFC800',
  goldDark: '#E5A700',

  // Orange / Streak
  orange: '#FF9600',
  orangeDark: '#E08600',

  // Blue / Info
  blue: '#1CB0F6',
  blueDark: '#0E8AC7',

  // Purple / Mente
  purple: '#CE82FF',
  purpleDark: '#A855F7',

  // Red / Error
  error: '#FF4B4B',
  errorDark: '#DC2626',

  // Grays
  locked: '#4B5563',
  lockedDark: '#374151',

  // Text
  text: '#FFFFFF',
  textSecondary: '#AFAFAF',
  textDark: '#0F1B2D',

  // Legacy compatibility
  accent: '#FF9600',
  card: '#243B5C',
  textLight: '#FFFFFF',
  success: '#58CC02',
  successLight: '#D7FFB8',
  border: '#374151',
  lockedBg: '#374151',
} as const;

export const categoryColors: Record<string, { main: string; dark: string }> = {
  hidratacao: { main: '#1CB0F6', dark: '#0E8AC7' },
  movimento: { main: '#FF9600', dark: '#E08600' },
  alimentacao: { main: '#58CC02', dark: '#46A302' },
  mente: { main: '#CE82FF', dark: '#A855F7' },
  sono: { main: '#5E72E4', dark: '#4C5CC4' },
  prevencao: { main: '#FF4B4B', dark: '#DC2626' },
  habitos: { main: '#FFC800', dark: '#E5A700' },
};

export const shadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
};

export const glowShadow: ViewStyle = {
  shadowColor: '#58CC02',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 12,
  elevation: 8,
};

export const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 2,
};
