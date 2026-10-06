import { Redirect, Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useAppStore } from '@/store/useAppStore';

export default function TabsLayout() {
  const hasPlan = useAppStore((s) => s.plan !== null);
  if (!hasPlan) return <Redirect href="/welcome" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
