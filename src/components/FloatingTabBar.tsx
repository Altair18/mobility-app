import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import { tap } from '@/lib/haptics';
import { useNow } from '@/lib/useNow';
import { resolveLook, useLook } from '@/store/useLook';

import { Icon, type IconName } from './Icon';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Today', icon: 'today' },
  plan: { label: 'Plan', icon: 'plan' },
  progress: { label: 'Progress', icon: 'arc' },
  settings: { label: 'Settings', icon: 'sliders' },
};

const DARK_ACCENT = '#A6F2C8';
const DARK_MUTED = 'rgba(244,238,227,0.6)';

/** Floating, frosted pill tab bar. */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const choice = useLook((s) => s.choice);
  const now = useNow();
  // Prototype: the bar turns dark with the evening look on the Today tab.
  const dark = state.routes[state.index]?.name === 'index' && resolveLook(choice, now) === 'evening';
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <View style={styles.shadow}>
        <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={[styles.bar, dark && styles.barDark]}>
          {state.routes.map((route, index) => {
            const tab = TABS[route.name];
            if (!tab) return null;
            const focused = state.index === index;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={tab.label}
                onPress={() => {
                  tap();
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
                }}
                style={[styles.tab, focused && (dark ? styles.tabOnDark : styles.tabOn)]}
              >
                <Icon
                  name={tab.icon}
                  size={23}
                  color={dark ? (focused ? DARK_ACCENT : DARK_MUTED) : focused ? colors.green : colors.muted}
                  tint={dark ? DARK_ACCENT : colors.green}
                  strokeWidth={1.8}
                  active={focused}
                />
                <Text maxFontSizeMultiplier={1.15} style={[styles.label, dark && { color: DARK_MUTED }, focused && (dark ? styles.labelOnDark : styles.labelOn)]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, pointerEvents: 'box-none' },
  shadow: { borderRadius: 32, boxShadow: '0px 14px 30px -12px rgba(70,50,20,0.35)' },
  bar: {
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    padding: 6,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(255,251,244,0.86)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, borderRadius: 26, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabOn: { backgroundColor: 'rgba(47,122,86,0.10)' },
  barDark: { backgroundColor: 'rgba(16,30,23,0.86)', borderColor: 'rgba(255,255,255,0.08)' },
  tabOnDark: { backgroundColor: 'rgba(166,242,200,0.12)' },
  labelOnDark: { fontFamily: fonts.bold, color: DARK_ACCENT },
  label: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
  labelOn: { fontFamily: fonts.bold, color: colors.greenText },
});
