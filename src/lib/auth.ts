import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import type { Account } from '@/data/types';

/**
 * Accounts are stored on the device for now. Cloud sync (so progress survives a reinstall or a
 * new phone) needs a backend — see the README.
 */
export async function appleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signInWithApple(): Promise<Account | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
    return { provider: 'apple', id: credential.user, email: credential.email ?? undefined, name: name || undefined };
  } catch (error) {
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw error;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function emailAccount(email: string): Account {
  const clean = email.trim().toLowerCase();
  return { provider: 'email', id: clean, email: clean };
}
