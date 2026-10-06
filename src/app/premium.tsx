import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon, type IconName } from '@/components/Icon';
import { T } from '@/components/T';
import { IconButton, PrimaryButton, Screen } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, shadows } from '@/constants/theme';
import { AREA_ORDER } from '@/data/areas';
import type { AreaId } from '@/data/types';
import { continueFirstRun } from '@/lib/flow';
import { success, tap } from '@/lib/haptics';
import { buy, loadOptions, purchasesLive, restore, type PaywallOption } from '@/lib/purchases';
import { useAppStore } from '@/store/useAppStore';

const BENEFITS: { icon: IconName; label: string }[] = [
  { icon: 'infinity', label: 'Unlimited sessions' },
  { icon: 'person', label: 'Every area, any time' },
  { icon: 'layers', label: 'Every programme' },
  { icon: 'arc', label: 'Full progress history' },
];

const ALL_AREAS = Object.fromEntries(AREA_ORDER.map((a) => [a, 0.55])) as Partial<Record<AreaId, number>>;

export default function Premium() {
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const inFlow = flow === '1';
  const isPremium = useAppStore((s) => s.isPremium);
  const setPremium = useAppStore((s) => s.setPremium);
  const setFlag = useAppStore((s) => s.setFlag);
  const [options, setOptions] = useState<PaywallOption[]>([]);
  const [selected, setSelected] = useState<PaywallOption['id']>('annual');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFlag('seenPaywall');
    loadOptions().then((list) => {
      setOptions(list);
      if (!list.some((o) => o.id === 'annual') && list[0]) setSelected(list[0].id);
    });
  }, [setFlag]);

  const close = () => (inFlow ? continueFirstRun('premium') : router.back());
  const option = options.find((o) => o.id === selected);

  const purchase = async () => {
    if (!option) return;
    setBusy(true);
    setMessage('');
    try {
      if (await buy(option)) {
        setPremium(true);
        success();
        close();
      }
    } catch {
      setMessage('The purchase did not go through. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const restorePurchases = async () => {
    setMessage('');
    const active = await restore();
    if (active) {
      setPremium(true);
      close();
    } else {
      setMessage(active === null ? 'Restore works once the App Store is connected.' : 'No purchases to restore.');
    }
  };

  if (isPremium && !busy) {
    return (
      <Screen modal>
        <IconButton icon="close" label="Close" onPress={close} />
        <View style={styles.activeStage}>
          <View style={styles.activeFigure}>
            <View style={styles.activeHalo} />
            <BodyFigure height={200} glows={ALL_AREAS} />
          </View>
          <T variant="title" center style={{ marginTop: 20 }}>
            Premium is on
          </T>
          <T variant="body" color={colors.muted} center style={{ marginTop: 8 }}>
            Every session, area and programme is open.
          </T>
        </View>
        <PrimaryButton label="Done" onPress={close} />
      </Screen>
    );
  }

  const cta = option?.trial ? 'Start free trial' : 'Subscribe';
  const note = option ? (option.trial ? `${option.trial}, then ${option.price}. Cancel anytime.` : `${option.price}. Cancel anytime.`) : '';

  return (
    <Screen modal>
      <View style={styles.header}>
        <IconButton icon="close" label="Close" onPress={close} />
        <Pressable accessibilityRole="button" onPress={restorePurchases} style={styles.restore}>
          <T variant="smallStrong" color={colors.muted} style={{ fontSize: 15 }}>
            Restore
          </T>
        </Pressable>
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.halo} />
          <BodyFigure height={168} glows={ALL_AREAS} />
        </View>
        <T variant="kicker" center style={{ marginTop: 14 }}>
          Premium
        </T>
        <T variant="title" center style={styles.title}>
          Keep progressing
        </T>
        <T variant="body" color={colors.muted} center style={{ marginTop: 6 }}>
          Unlimited sessions, built around your body.
        </T>
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.label} style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Icon name={b.icon} size={18} color={colors.green} />
              </View>
              <T variant="body" style={{ fontFamily: fonts.medium }}>
                {b.label}
              </T>
            </View>
          ))}
        </View>
        <View style={styles.plans}>
          {options.map((o) => {
            const on = o.id === selected;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tap();
                  setSelected(o.id);
                }}
                style={[styles.plan, on && styles.planOn]}
              >
                {o.trial ? (
                  <View style={styles.badge}>
                    <T style={styles.badgeText}>{o.trial}</T>
                  </View>
                ) : null}
                <T variant="smallStrong" color={colors.muted}>
                  {o.title}
                </T>
                <T variant="h2" style={{ marginTop: 4 }}>
                  {o.price}
                </T>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.cream} />
        </View>
      ) : (
        <PrimaryButton label={cta} onPress={purchase} disabled={!option} />
      )}
      <T variant="caption" center style={{ marginTop: 10 }}>
        {message || note}
      </T>
      {!purchasesLive() ? (
        <T variant="caption" center color={colors.greenText} style={{ marginTop: 4 }}>
          Test mode: no payment is taken.
        </T>
      ) : null}
      <View style={styles.links}>
        <T variant="caption" style={styles.link} onPress={() => Linking.openURL(config.links.terms)}>
          Terms
        </T>
        <T variant="caption" style={styles.link} onPress={() => Linking.openURL(config.links.privacy)}>
          Privacy
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restore: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  scroll: { paddingTop: 10, paddingBottom: 16 },
  hero: { alignSelf: 'center', width: 200, height: 168, alignItems: 'center' },
  halo: { position: 'absolute', left: 10, top: -6, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(47,122,86,0.09)' },
  title: { marginTop: 4, fontSize: 34, lineHeight: 38 },
  benefits: { marginTop: 22, gap: 12, paddingHorizontal: 6 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  plans: { marginTop: 24, flexDirection: 'row', gap: 12 },
  plan: {
    flex: 1,
    height: 88,
    borderRadius: 22,
    paddingTop: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.14)',
  },
  planOn: { borderWidth: 2, borderColor: colors.green, boxShadow: shadows.small },
  badge: { position: 'absolute', left: 12, top: -11, height: 22, paddingHorizontal: 10, borderRadius: 11, backgroundColor: colors.green, justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },
  busy: { height: 56, borderRadius: 28, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  links: { marginTop: 6, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  link: { fontSize: 12, textDecorationLine: 'underline' },
  activeStage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeFigure: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  activeHalo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(47,122,86,0.09)' },
});
