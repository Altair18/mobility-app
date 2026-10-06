import type { RefObject } from 'react';
import type { View } from 'react-native';

// The browser preview can't save to Photos or open the share sheet; the share screen says so.
export const canShareImages = false;

export async function captureCard(_ref: RefObject<View | null>): Promise<string> {
  throw new Error('Sharing works on your phone.');
}

export async function shareImage(_uri: string): Promise<void> {}

export async function saveImage(_uri: string): Promise<boolean> {
  return false;
}
