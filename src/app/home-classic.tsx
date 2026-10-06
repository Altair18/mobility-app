// Previous Today screen, kept at /home-classic to compare with the new design. Delete once the team has chosen.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AreaIcon } from '@/components/AreaIcon';
import { Icon } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { T } from '@/components/T';
import { Card, SandPill, Screen } from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { colors, fonts, POSE_COLORS, shadows } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import { PROGRAMMES } from '@/data/content';
import { getExercise } from '@/data/exercises';
import { DAY_LONG, headerDate, weekdayIndex } from '@/lib/dates';
import { startSession } from '@/lib/flow';
import { tap } from '@/lib/haptics';
import { nextSession, streak, thisWeek, weekDays } from '@/lib/progress';
import { useNow } from '@/lib/useNow';
import { useAppStore } from '@/store/useAppStore';

const CARD_W = 296;
const GAP = 12;

export default function TodayClassic() {
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const isPremium = useAppStore((s) => s.isPremium);
  const areaLevels = useAppStore((s) => s.areaLevels);
  const programmeDays = useAppStore((s) => s.programmeDays);
  const startProgramme = useAppStore((s) => s.startProgramme);
  const [page, setPage] = useState(0);
  const now = useNow();
  if (!plan) return null;

  const next = nextSession(plan, history, now);
  const done = thisWeek(history, now).length;
  const days = weekDays(plan, history, now);
  const run = streak(plan, history, now);
  const programme = PROGRAMMES[1];

  const session = next?.session;
  const level = session ? Math.max(...session.areas.map((a) => areaLevels[a] ?? plan.level)) : plan.level;
  // The hero shows the session's first move, with the green dot on the area it works.
  const heroPose = (session && getExercise(session.exerciseIds[0])?.pose) ?? 'reach';
  const kicker = !session
    ? 'This week'
    : next?.when === 'upcoming'
      ? `${DAY_LONG[session.weekday].toUpperCase()} · ${session.minutes} MIN`
      : next?.when === 'catchup'
        ? `CATCH UP · ${session.minutes} MIN`
        : `TODAY · ${session.minutes} MIN`;

  const openProgramme = () => {
    if (!isPremium) {
      router.push('/premium');
      return;
    }
    const s = startProgramme(programme.id);
    if (s) router.push({ pathname: '/session', params: { id: s.id } });
  };

  return (
    <Screen scroll tabBar>
      <View style={styles.header}>
        <View>
          <T style={styles.date}>{headerDate(now)}</T>
          <T variant="title" style={styles.day}>
            {DAY_LONG[weekdayIndex(now)]}
          </T>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streak} accessibilityLabel={`${run} day streak`}>
            <Icon name="flame" size={15} color={colors.flame} />
            <T style={styles.streakText}>{String(run)}</T>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.navigate('/settings')} style={styles.profile}>
            <Icon name="user" size={17} color={colors.green} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (CARD_W + GAP)))}
        scrollEventThrottle={32}
      >
        <Card
          big
          style={styles.hero}
          onPress={session ? () => startSession(session.id) : undefined}
          accessibilityLabel={session ? `Start ${session.title}` : 'Week complete'}
        >
          <T variant="kicker">{kicker}</T>
          <T variant="title" style={styles.heroTitle}>
            {session ? session.title : 'Week complete'}
          </T>
          <T variant="small" style={{ marginTop: 10 }}>
            {session ? `${session.exerciseIds.length} moves · Level ${level}` : 'See you on Monday.'}
          </T>
          <View style={styles.flex} />
          {session ? <SandPill /> : null}
          <View style={styles.heroFigure} pointerEvents="none">
            <PoseBubble pose={heroPose} size={132} color={POSE_COLORS[(session?.weekday ?? 0) % POSE_COLORS.length]} dot={!!session} shadow />
          </View>
        </Card>
        <Card big style={styles.peek} onPress={openProgramme} accessibilityLabel={programme.title}>
          <T variant="kicker">{programme.meta}</T>
          <T variant="h2" style={styles.peekTitle}>
            {programme.title}
          </T>
          <View style={styles.premiumLine}>
            {isPremium ? (
              <T variant="caption">{`Day ${Math.min(programme.days, (programmeDays[programme.id] ?? 0) + 1)} of ${programme.days}`}</T>
            ) : (
              <>
                <Icon name="lock" size={12} color={colors.muted} strokeWidth={2.4} />
                <T variant="caption">Premium</T>
              </>
            )}
          </View>
          <View style={styles.flex} />
          <PoseBubble pose={programme.pose} size={96} color={programme.color} shadow style={styles.peekBubble} />
        </Card>
      </ScrollView>
      <View style={styles.dots}>
        <View style={[styles.dot, page === 0 && styles.dotOn]} />
        <View style={[styles.dot, page === 1 && styles.dotOn]} />
      </View>

      <Card style={styles.week} onPress={() => router.navigate('/progress')} accessibilityLabel={`This week, ${done} of ${plan.days}`}>
        <View style={styles.weekTop}>
          <T variant="kicker">This week</T>
          <T variant="smallStrong" style={{ fontSize: 15, fontFamily: fonts.bold }}>{`${done} of ${plan.days}`}</T>
        </View>
        <WeekStrip days={days} />
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          tap();
          router.push('/focus');
        }}
        style={({ pressed }) => [styles.stiff, pressed && { opacity: 0.9 }]}
      >
        <Icon name="target" size={20} color={colors.green} />
        <T variant="body" color={colors.muted} style={styles.flex}>
          Where are you stiff today?
        </T>
        {isPremium ? null : <Icon name="lock" size={14} color={colors.muted} strokeWidth={2.2} />}
      </Pressable>

      <View style={styles.areasHeader}>
        <T variant="kicker">Your areas</T>
        <Pressable accessibilityRole="button" onPress={() => router.push('/edit-areas')} hitSlop={8}>
          <T variant="smallStrong">Edit</T>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areasRow} contentContainerStyle={styles.areasContent}>
        {plan.areas.map((a) => (
          <Card key={a} style={styles.area} onPress={() => router.push({ pathname: '/area/[id]', params: { id: a } })} accessibilityLabel={AREA_NAMES[a]}>
            <AreaIcon area={a} size={36} />
            <View>
              <T variant="bodyStrong" style={{ fontSize: 15 }}>
                {AREA_NAMES[a]}
              </T>
              <T variant="caption" style={{ fontSize: 12 }}>{`Level ${areaLevels[a] ?? plan.level} of 3`}</T>
            </View>
          </Card>
        ))}
        <Pressable accessibilityRole="button" onPress={() => router.push('/edit-areas')} style={styles.addArea}>
          <View style={styles.addIcon}>
            <Icon name="plus" size={18} color={colors.green} strokeWidth={2.2} />
          </View>
          <View>
            <T variant="bodyStrong" style={{ fontSize: 15 }}>
              Add an area
            </T>
            {isPremium ? null : (
              <View style={styles.premiumLine}>
                <Icon name="lock" size={10} color={colors.muted} strokeWidth={2.6} />
                <T variant="caption" style={{ fontSize: 12 }}>
                  Premium
                </T>
              </View>
            )}
          </View>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  date: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  day: { fontSize: 28, lineHeight: 32, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streak: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 19,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    boxShadow: shadows.small,
  },
  streakText: { fontFamily: fonts.bold, fontSize: 15, color: colors.flameText },
  profile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.small,
  },
  carousel: { marginTop: 16, marginHorizontal: -24 },
  carouselContent: { paddingHorizontal: 24, paddingBottom: 36, gap: GAP },
  hero: { width: CARD_W, height: 288, padding: 24, overflow: 'hidden' },
  heroTitle: { marginTop: 6, width: 170, lineHeight: 32 },
  heroFigure: { position: 'absolute', right: 20, bottom: 22 },
  peek: { width: 220, height: 288, padding: 24, overflow: 'hidden' },
  peekTitle: { marginTop: 6, fontSize: 26, lineHeight: 29 },
  peekBubble: { alignSelf: 'flex-end' },
  premiumLine: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: -24 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CFC0A6' },
  dotOn: { width: 18, backgroundColor: colors.green },
  week: { marginTop: 16, paddingVertical: 16, paddingHorizontal: 18, gap: 14 },
  weekTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  stiff: {
    marginTop: 12,
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.small,
  },
  areasHeader: { marginTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  areasRow: { marginTop: 10, marginHorizontal: -24 },
  areasContent: { paddingHorizontal: 24, paddingBottom: 14, gap: 10 },
  area: { width: 132, height: 100, padding: 14, justifyContent: 'space-between' },
  addArea: {
    width: 132,
    height: 100,
    padding: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(90,70,40,0.25)',
    backgroundColor: 'rgba(255,253,249,0.5)',
    justifyContent: 'space-between',
  },
  addIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.green, alignItems: 'center', justifyContent: 'center' },
});
