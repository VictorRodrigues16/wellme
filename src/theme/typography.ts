import { TextStyle } from 'react-native';

export const fontFamily = {
  black: 'Nunito_900Black',
  extraBold: 'Nunito_800ExtraBold',
  bold: 'Nunito_700Bold',
  semiBold: 'Nunito_600SemiBold',
  regular: 'Nunito_400Regular',
};

export const typography: Record<string, TextStyle> = {
  hero: {
    fontFamily: fontFamily.extraBold,
    fontSize: 32,
    lineHeight: 40,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  caption: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  small: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  stat: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    lineHeight: 34,
  },
};
