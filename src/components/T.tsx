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
  hero: { fontFamily: fonts.display, fontSize: 46, lineHeight: 50, letterSpacing: -1.2, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.4, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.2, color: colors.ink },
  stat: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.ink },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.ink },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19, color: colors.muted },
  smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19, color: colors.ink },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 17, color: colors.muted },
  kicker: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, color: colors.greenText, textTransform: 'uppercase' },
  button: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.ink },
  center: { textAlign: 'center' },
});
