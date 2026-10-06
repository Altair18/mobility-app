import { Platform } from 'react-native';

import type { AreaId } from '@/data/types';

/** Animations run on the native thread on phones; the browser has no such thread. */
export const NATIVE_DRIVER = Platform.OS !== 'web';

export const colors = {
  bgTop: '#FFF8EC',
  bgMid: '#EFE5D3',
  bgBottom: '#E3D5BE',
  card: '#FFFDF9',
  cardEnd: '#F3E9DA',
  ink: '#1C1A16',
  muted: '#574F43',
  faint: '#7A6F60',
  chevron: '#9A8E7C',
  border: 'rgba(90,70,40,0.12)',
  line: 'rgba(90,70,40,0.16)',
  track: 'rgba(90,70,40,0.12)',
  green: '#2F7A56',
  greenText: '#22644A',
  greenDeep: '#1F5A3E',
  greenTint: 'rgba(47,122,86,0.12)',
  mint: '#A6F2C8',
  cream: '#FFF8EC',
  sandTop: '#DDCDB0',
  sandBottom: '#C4B08D',
  figure: '#E3D6C0',
  flame: '#E8772A',
  flameText: '#A44E12',
  sheet: '#FFFCF6',
  scrim: 'rgba(28,26,22,0.45)',
  white: '#FFFFFF',
} as const;

/** Large text settings still scale the app, but only so far, so rows and buttons keep their shape. */
export const MAX_FONT_SCALE = 1.3;

export const fonts = {
  /** Headlines and big numbers. */
  display: 'PlusJakartaSans_700Bold',
  displayMedium: 'PlusJakartaSans_600SemiBold',
  /** Everything else. */
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const shadows = {
  card: '0px 1px 2px rgba(70,50,20,0.08), 0px 14px 30px -10px rgba(70,50,20,0.28)',
  small: '0px 6px 14px -6px rgba(70,50,20,0.22)',
  button: '0px 12px 24px -12px rgba(28,26,22,0.6)',
  green: '0px 8px 16px -10px rgba(47,122,86,0.7)',
  bubble: '0px 8px 18px -8px rgba(70,50,20,0.45)',
} as const;

/** Bubble colours for the pose drawings, used in rotation. */
export const POSE_COLORS = ['#9FBFA8', '#D9BE93', '#D49A7C', '#93A9BC', '#B4B98A'] as const;

/** Move bubbles are coloured by the body region a move works, so the colour carries meaning. */
export const REGION_COLORS: Record<AreaId, string> = {
  neck: '#93A9BC',
  shoulders: '#93A9BC',
  elbows: '#B4B98A',
  wrists: '#B4B98A',
  upperBack: '#9FBFA8',
  lowerBack: '#9FBFA8',
  hips: '#D9BE93',
  knees: '#D49A7C',
  ankles: '#D49A7C',
  feet: '#D49A7C',
};

export const SCREEN_PADDING = 24;
/** Space to leave under scrolling tab screens so content clears the floating tab bar. */
export const TAB_BAR_SPACE = 110;
