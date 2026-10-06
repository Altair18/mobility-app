// Import only the weights the app uses, so the other font files stay out of the app.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors } from '@/constants/theme';
import { setupNotifications } from '@/lib/notifications';
import { fetchPremium, initPurchases } from '@/lib/purchases';
import { frameFor } from '@/lib/viewport';
import { useAppStore, useHydrated } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hydrated = useHydrated();
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    setupNotifications();
    initPurchases();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // When RevenueCat is set up, the store is the source of truth for Premium.
    fetchPremium().then((active) => {
      if (active !== null) useAppStore.getState().setPremium(active);
    });
  }, [hydrated]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <DesktopFrame>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgTop } }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="session" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="complete" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="save" options={{ gestureEnabled: false }} />
        <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        <Stack.Screen name="reminder" />
        <Stack.Screen name="edit-areas" options={{ presentation: 'modal' }} />
        <Stack.Screen name="focus" options={{ presentation: 'modal' }} />
        <Stack.Screen name="limit" options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="share" options={{ presentation: 'modal' }} />
        <Stack.Screen name="exercise/[id]" />
        <Stack.Screen name="area/[id]" />
      </Stack>
    </DesktopFrame>
  );
}

/** In a wide browser window the app sits in a phone-sized frame instead of stretching across the page. */
function DesktopFrame({ children }: { children: ReactNode }) {
  const frame = frameFor(useWindowDimensions());
  if (!frame) return children;
  return (
    <View style={styles.desk}>
      <View style={[styles.frame, { width: frame.width, height: frame.height }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  desk: { flex: 1, backgroundColor: '#15130F', alignItems: 'center', justifyContent: 'center' },
  frame: {
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.bgTop,
    boxShadow: '0px 30px 80px -20px rgba(0,0,0,0.8), 0px 0px 0px 8px #26231D',
  },
});
