import { Platform, useWindowDimensions } from 'react-native';

/** Width of the phone-sized frame the app sits in on a wide browser window. */
export const FRAME_WIDTH = 420;
const FRAME_MAX_HEIGHT = 900;

type Size = { width: number; height: number };

/** On a desktop browser the app is shown in a phone-sized frame; this is the frame's size, or null on phones. */
export function frameFor(window: Size): Size | null {
  if (Platform.OS !== 'web' || window.width < 520 || window.height < 480) return null;
  return { width: FRAME_WIDTH, height: Math.min(window.height - 48, FRAME_MAX_HEIGHT) };
}

/** The size screens have to lay out in: the window on a phone, the frame on a desktop browser. */
export function useViewport(): Size {
  const window = useWindowDimensions();
  return frameFor(window) ?? window;
}
