import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fonts, MAX_FONT_SCALE } from '@/constants/theme';

export type TextVariant =
  | 'hero'
  | 'title'
  | 'h2'
  | 'stat'
  | 'body'
  | 'bodyStrong'
  | 'small'
  | 'smallStrong'
  | 'caption'
  | 'kicker'
  | 'button';

type Props = TextProps & { variant?: TextVariant; color?: string; center?: boolean };

/** All app text goes through here so fonts and sizes stay consistent. */
export function T({ variant = 'body', color, center, style, ...rest }: Props) {
  return <Text maxFontSizeMultiplier={MAX_FONT_SCALE} {...rest} style={[styles[variant], color ? { color } : null, center ? styles.center : null, style]} />;
}

const styles = StyleSheet.create({
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -1.2, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.7, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, letterSpacing: -0.4, color: colors.ink },
  stat: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.6, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, letterSpacing: -0.1, color: colors.ink },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1, color: colors.ink },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.ink },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  kicker: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1.1, color: colors.greenText, textTransform: 'uppercase' },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1, color: colors.ink },
  center: { textAlign: 'center' },
});
