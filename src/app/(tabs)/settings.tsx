import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { Screen } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, shadows } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import { timeLabel } from '@/lib/dates';
import { cancelReminders } from '@/lib/notifications';
import { restore } from '@/lib/purchases';
import { useAppStore } from '@/store/useAppStore';

type RowProps = { label: string; value?: string; href?: Href; onPress?: () => void; last?: boolean };

function Row({ label, value, href, onPress, last }: RowProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress ?? (href ? () => router.push(href) : undefined)}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(90,70,40,0.05)' }]}
      >
        <T variant="body" style={[styles.flex, { fontFamily: fonts.medium }]}>
          {label}
        </T>
        {value ? (
          <T variant="body" color={colors.muted} numberOfLines={1} style={styles.value}>
            {value}
          </T>
        ) : null}
        {href ? <Icon name="chevron" size={16} color={colors.chevron} strokeWidth={2.2} /> : null}
      </Pressable>
      {last ? null : <View style={styles.hairline} />}
    </>
  );
}

export default function SettingsTab() {
  const plan = useAppStore((s) => s.plan);
  const account = useAppStore((s) => s.account);
  const reminder = useAppStore((s) => s.reminder);
  const isPremium = useAppStore((s) => s.isPremium);
  const setPremium = useAppStore((s) => s.setPremium);
  const reset = useAppStore((s) => s.reset);
  const [note, setNote] = useState('');
  if (!plan) return null;

  const restorePurchases = async () => {
    const active = await restore();
    if (active) setPremium(true);
    setNote(active ? 'Premium restored.' : active === null ? 'Restore works once the App Store is connected.' : 'No purchases to restore.');
  };

  return (
    <Screen scroll tabBar>
      <T variant="title" style={styles.title}>
        Settings
      </T>

      {isPremium ? (
        <View style={[styles.group, styles.premiumOn]}>
          <Icon name="check" size={18} color={colors.green} strokeWidth={2.6} />
          <T variant="bodyStrong">Premium is on</T>
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => router.push('/premium')} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
          <LinearGradient colors={['#2B3A31', colors.ink]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.premiumCard}>
            <View style={styles.flex}>
              <T variant="bodyStrong" color={colors.cream} style={{ fontSize: 17, fontFamily: fonts.bold }}>
                Try Premium free
              </T>
              <T variant="caption" color="#CFC6B6" style={{ marginTop: 2 }}>
                Unlimited sessions, every area
              </T>
            </View>
            <View style={styles.arrow}>
              <Icon name="chevron" size={16} color={colors.white} strokeWidth={2.6} />
            </View>
          </LinearGradient>
        </Pressable>
      )}

      <T variant="kicker" style={styles.section}>
        Your plan
      </T>
      <View style={styles.group}>
        <Row label="Areas" value={plan.areas.map((a) => AREA_NAMES[a]).join(', ')} href="/edit-areas" />
        <Row label="Days a week" value={plan.days === 7 ? 'Every day' : String(plan.days)} href={{ pathname: '/onboarding/days', params: { edit: '1' } }} />
        <Row label="Session length" value={`${plan.minutes} min`} href={{ pathname: '/onboarding/length', params: { edit: '1' } }} last />
      </View>

      <T variant="kicker" style={styles.section}>
        General
      </T>
      <View style={styles.group}>
        <Row label="Reminders" value={reminder ? timeLabel(reminder.hour, reminder.minute) : 'Off'} href={{ pathname: '/reminder', params: { edit: '1' } }} />
        <Row
          label="Account"
          value={account ? (account.provider === 'apple' ? 'Apple' : (account.email ?? 'Email')) : 'Not signed in'}
          href={{ pathname: '/save', params: { edit: '1' } }}
        />
        <Row label="Restore purchases" onPress={restorePurchases} />
        <Row label="Help" onPress={() => Linking.openURL(config.links.help)} />
        <Row label="Privacy and terms" onPress={() => Linking.openURL(config.links.privacy)} last />
      </View>
      {note ? (
        <T variant="caption" center style={{ marginTop: 10 }}>
          {note}
        </T>
      ) : null}

      {__DEV__ ? (
        <>
          <T variant="kicker" style={styles.section}>
            Testing
          </T>
          <View style={styles.group}>
            <View style={styles.row}>
              <T variant="body" style={[styles.flex, { fontFamily: fonts.medium }]}>
                Premium (test)
              </T>
              <Switch value={isPremium} onValueChange={setPremium} trackColor={{ true: colors.green, false: colors.line }} />
            </View>
            <View style={styles.hairline} />
            <Row
              label="Start again from Welcome"
              onPress={async () => {
                await cancelReminders();
                router.replace('/welcome');
                reset();
              }}
              last
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { minHeight: 44, textAlignVertical: 'center' },
  premiumCard: { marginTop: 12, height: 76, borderRadius: 24, paddingLeft: 20, paddingRight: 16, flexDirection: 'row', alignItems: 'center', gap: 12, boxShadow: '0px 14px 28px -14px rgba(28,26,22,0.7)' },
  arrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  premiumOn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18 },
  section: { marginTop: 26 },
  group: {
    marginTop: 10,
    borderRadius: 22,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    boxShadow: shadows.small,
  },
  row: { minHeight: 52, paddingHorizontal: 16, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { maxWidth: 170 },
  hairline: { marginLeft: 16, height: 1, backgroundColor: 'rgba(90,70,40,0.10)' },
});
