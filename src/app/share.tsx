import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { T } from '@/components/T';
import { IconButton, PrimaryButton, Screen, SecondaryButton } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts } from '@/constants/theme';
import type { AreaId } from '@/data/types';
import { canShareImages, captureCard, saveImage, shareImage } from '@/lib/share';
import { minutesOf, thisWeek, weekDays, weekNumber } from '@/lib/progress';
import { useAppStore } from '@/store/useAppStore';

const MINT = colors.mint;
const MINT_SOFT = '#CFE8DA';

export default function Share() {
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const card = useRef<View>(null);
  const [note, setNote] = useState('');
  if (!plan) return null;

  const now = new Date();
  const week = thisWeek(history, now);
  const days = weekDays(plan, history, now);
  const glows = Object.fromEntries(plan.areas.map((a) => [a, 0.95])) as Partial<Record<AreaId, number>>;

  const run = async (action: 'save' | 'share') => {
    if (!canShareImages) {
      setNote('Sharing works on your phone.');
      return;
    }
    try {
      const uri = await captureCard(card);
      if (action === 'share') {
        await shareImage(uri);
        return;
      }
      let saved: boolean;
      try {
        saved = await saveImage(uri);
      } catch {
        // Saving isn't available here: the share sheet has "Save Image" too.
        await shareImage(uri);
        return;
      }
      setNote(saved ? 'Saved to Photos.' : 'Allow Photos access to save the card.');
    } catch {
      setNote('That did not work. Please try again.');
    }
  };

  return (
    <Screen modal>
      <View style={styles.header}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <T variant="bodyStrong" center style={styles.flex}>
          Share your week
        </T>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.stage}>
        <View ref={card} collapsable={false} style={styles.cardShadow}>
          <LinearGradient colors={['#2F7A56', '#1F4A37', '#142A20']} locations={[0, 0.55, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.card}>
            <View style={styles.figure} pointerEvents="none">
              <BodyFigure height={208} glows={glows} fill="#3B6351" glowColor={MINT} />
            </View>
            <T style={styles.kicker}>{`WEEK ${weekNumber(plan, now)}`}</T>
            <T style={styles.big}>{`${week.length}/${plan.days}`}</T>
            <T style={styles.caption}>sessions this week</T>
            <View style={styles.flex} />
            <T style={styles.mid}>{String(minutesOf(week))}</T>
            <T style={styles.caption}>mobility minutes</T>
            <View style={styles.footer}>
              <T style={styles.brand}>{config.appName}</T>
              <View style={styles.dots}>
                {days.map((d) => (
                  <View
                    key={d.weekday}
                    style={[
                      styles.dot,
                      d.status === 'done'
                        ? { backgroundColor: MINT }
                        : d.status === 'today' || d.status === 'planned'
                          ? { borderWidth: 1.5, borderColor: MINT }
                          : { backgroundColor: 'rgba(207,232,218,0.18)' },
                    ]}
                  />
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {note ? (
        <T variant="caption" center style={{ marginBottom: 12 }}>
          {note}
        </T>
      ) : null}
      <View style={styles.buttons}>
        <SecondaryButton label="Save image" icon="download" style={styles.flex} onPress={() => run('save')} />
        <PrimaryButton label="Share" icon="share" style={styles.flex} onPress={() => run('share')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardShadow: { borderRadius: 32, boxShadow: '0px 30px 50px -24px rgba(20,42,32,0.7)' },
  card: { width: 300, height: 420, borderRadius: 32, padding: 26, overflow: 'hidden' },
  figure: { position: 'absolute', right: 18, top: 92 },
  kicker: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.4, color: MINT },
  big: { marginTop: 10, fontFamily: fonts.display, fontSize: 76, lineHeight: 80, letterSpacing: -2, color: colors.cream },
  caption: { marginTop: 4, width: 150, fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: MINT_SOFT },
  mid: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, color: colors.cream },
  footer: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(207,232,218,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontFamily: fonts.display, fontSize: 16, color: colors.cream },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  buttons: { flexDirection: 'row', gap: 10 },
});
