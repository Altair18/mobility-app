import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current time for a screen. It refreshes when the screen comes into view, when the app
 * returns from the background, and once a minute while open, so "Today" and the date never go
 * stale if the app is left open overnight.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      const timer = setInterval(() => setNow(new Date()), 60_000);
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') setNow(new Date());
      });
      return () => {
        clearInterval(timer);
        sub.remove();
      };
    }, []),
  );

  return now;
}
