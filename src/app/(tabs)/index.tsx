import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AreaIcon } from '@/components/AreaIcon';
import { BodyFigure } from '@/components/BodyFigure';
import { Icon } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { PremiumSheet } from '@/components/Sheet';
import { T } from '@/components/T';
import { AskStage, ANSWERS, type Answer } from '@/components/today/AskStage';
import { Bento, streakIcon } from '@/components/today/Bento';
import { DockedStart } from '@/components/today/DockedStart';
import { DoneStage } from '@/components/today/DoneStage';
import { LookChip } from '@/components/today/LookChip';
import { SessionHero } from '@/components/today/SessionHero';
import { OptionPill, Screen } from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { LOOKS } from '@/constants/looks';
import { colors, fonts, REGION_COLORS, shadows } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import { PROGRAMMES } from '@/data/content';
import type { AreaId } from '@/data/types';
import { DAY_LONG, daysBetween, headerDate, isSameDay, partOfDay, relativeDay, weekdayIndex } from '@/lib/dates';
import { startSession } from '@/lib/flow';
import { insightLine } from '@/lib/insight';
import { adjustSession, type CheckIn } from '@/lib/plan';
import { lastTrained, nextSession, recencyGlow, streak, thisWeek, weekDays } from '@/lib/progress';
import { useCountTo } from '@/lib/useCountTo';
import { useNow } from '@/lib/useNow';
import { useAppStore } from '@/store/useAppStore';
import { resolveLook, useLook, type Layout, type LookChoice, type StageChoice } from '@/store/useLook';

const CHECK_IN_NOTE: Record<CheckIn, string | null> = {
  good: null,
  sore: 'Gentler moves, same areas',
  short: 'A 5-minute version',
};

const LOOK_CHOICES: [LookChoice, string][] = [
  ['current', 'Current'],
  ['vision', 'Vision'],
  ['evening', 'Evening'],
  ['auto', 'Auto'],
];
const LAYOUT_CHOICES: [Layout, string][] = [
  ['classic', 'Classic'],
  ['daily', 'Daily'],
];
const STAGE_CHOICES: [StageChoice, string][] = [
  ['auto', 'Auto'],
  ['ask', 'Ask'],
  ['plan', 'Plan'],
  ['done', 'Done'],
];

export default function Today() {
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const isPremium = useAppStore((s) => s.isPremium);
  const areaLevels = useAppStore((s) => s.areaLevels);
  const programmeDays = useAppStore((s) => s.programmeDays);
  const startProgramme = useAppStore((s) => s.startProgramme);
  const startCustom = useAppStore((s) => s.startCustom);
  const { choice, layout, stage: stageChoice, setChoice, setLayout, setStage } = useLook();
  const [answer, setAnswer] = useState<Answer | 'skip' | null>(null);
  const [sheet, setSheet] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroBottom, setHeroBottom] = useState(Infinity);
  const now = useNow();
  const look = resolveLook(choice, now);
  const L = LOOKS[look];

  // Light status bar text on the dark look, while this tab is showing.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(L.dark ? 'light' : 'dark');
      return () => setStatusBarStyle('dark');
    }, [L.dark]),
  );

  const checkIn: CheckIn | null = answer === 'sore' || answer === 'short' ? answer : null;
  const next = plan ? nextSession(plan, history, now) : null;
  const planned = next?.session;
  const session = plan && planned && checkIn ? adjustSession(planned, checkIn, plan, areaLevels) : planned;
  const minutes = useCountTo(session?.minutes ?? 0);
  if (!plan) return null;

  const done = thisWeek(history, now).length;
  const days = weekDays(plan, history, now);
  const run = streak(plan, history, now);
  const adjusted = !!session && session !== planned;
  const level = session ? Math.max(...session.areas.map((a) => areaLevels[a] ?? plan.level)) : plan.level;
  const kicker = !session
    ? 'This week'
    : next?.when === 'upcoming'
      ? `Next · ${DAY_LONG[session.weekday]}`
      : next?.when === 'catchup'
        ? 'Catch up'
        : 'Today';
  const note = checkIn ? CHECK_IN_NOTE[checkIn] : null;
  const todays = history.filter((h) => isSameDay(new Date(h.date), now));

  // Daily layout: ask until you answer, plan once you have, done once you've trained today.
  const autoStage = todays.length > 0 ? 'done' : answer || !session ? 'plan' : 'ask';
  const stage = stageChoice === 'auto' ? autoStage : stageChoice === 'ask' && !session ? 'plan' : stageChoice;

  // Areas glow by how recently they were trained, fading over about a week.
  const last = lastTrained(history);
  const bodyGlows = Object.fromEntries(
    Object.entries(last).map(([a, iso]) => [a, recencyGlow(daysBetween(new Date(iso as string), now))]),
  ) as Partial<Record<AreaId, number>>;

  const pick = (key: Answer) => {
    if (key === 'stiff') {
      router.push('/focus');
      return;
    }
    setAnswer(key);
    if (stageChoice === 'ask') setStage('plan');
  };

  const skip = () => {
    setAnswer('skip');
    if (stageChoice === 'ask') setStage('plan');
  };

  const reopenCheckIn = () => {
    setAnswer(null);
    if (stageChoice !== 'auto') setStage('ask');
  };

  const start = () => {
    if (!session) return;
    if (!adjusted) {
      startSession(session.id);
      return;
    }
    // Adjusting today's session to how you feel is a Premium feature.
    if (!isPremium) {
      setSheet(true);
      return;
    }
    startCustom(session);
    startSession(session.id);
  };

  const openProgramme = (id: string) => {
    if (!isPremium) {
      router.push('/premium');
      return;
    }
    const s = startProgramme(id);
    if (s) router.push({ pathname: '/session', params: { id: s.id } });
  };

  const answered = ANSWERS.find((a) => a.key === answer);
  const tag = answered ? { label: answered.label, icon: answered.icon, onChange: reopenCheckIn } : answer === 'skip' ? { label: 'As planned', icon: 'calendar' as const, onChange: reopenCheckIn } : undefined;
  const insight = insightLine(history, isPremium, now);
  const daily = layout === 'daily';
  const showDock = daily && stage === 'plan' && !!session && scrollY > heroBottom - 40;

  const hero = (
    <SessionHero
      L={L}
      session={session}
      kicker={kicker}
      minutes={minutes}
      level={level}
      note={note}
      tag={daily ? tag : undefined}
      onStart={start}
      onLayout={(e) => setHeroBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
    />
  );

  return (
    <Screen
      scroll
      tabBar
      onScroll={setScrollY}
      backdrop={L.background ? <LinearGradient colors={L.background} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} /> : undefined}
      overlay={session ? <DockedStart L={L} visible={showDock} session={session} minutes={session.minutes} onStart={start} /> : null}
    >
      {/* Prototype: switch looks, layouts and stages to compare them. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.protoRow}>
        <T style={[styles.protoLabel, { color: L.faint }]}>LOOK</T>
        {LOOK_CHOICES.map(([key, label]) => (
          <LookChip key={key} L={L} label={label} selected={choice === key} onPress={() => setChoice(key)} small />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.protoRow}>
        <T style={[styles.protoLabel, { color: L.faint }]}>LAYOUT</T>
        {LAYOUT_CHOICES.map(([key, label]) => (
          <LookChip key={key} L={L} label={label} selected={layout === key} onPress={() => setLayout(key)} small />
        ))}
        {daily ? (
          <>
            <View style={[styles.protoDivider, { backgroundColor: L.rule }]} />
            {STAGE_CHOICES.map(([key, label]) => (
              <LookChip key={key} L={L} label={label} selected={stageChoice === key} onPress={() => setStage(key)} small />
            ))}
          </>
        ) : null}
      </ScrollView>

      <View style={styles.header}>
        <View style={styles.flex}>
          <T style={[styles.date, { color: L.muted }]}>{headerDate(now)}</T>
          <T variant="title" color={L.ink} style={styles.day}>
            {`${DAY_LONG[weekdayIndex(now)]} ${partOfDay(now)}`}
          </T>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.streak, { backgroundColor: L.chip.bg, borderColor: L.chip.border }, L.dark && styles.flat]} accessibilityLabel={`${run} day streak`}>
            <Icon name={streakIcon(run)} size={17} color={L.accent} strokeWidth={1.9} />
            <T style={[styles.streakText, { color: L.accent }]}>{String(run)}</T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.navigate('/settings')}
            style={[styles.profile, { backgroundColor: L.chip.bg, borderColor: L.accent }, L.dark && styles.flat]}
          >
            <Icon name="user" size={17} color={L.accent} />
          </Pressable>
        </View>
      </View>
      {daily && insight ? (
        <T variant="small" color={L.muted} style={styles.insight}>
          {insight}
        </T>
      ) : null}

      {daily ? (
        stage === 'ask' ? (
          <AskStage L={L} onAnswer={pick} onSkip={skip} />
        ) : stage === 'done' ? (
          <>
            <DoneStage L={L} today={todays} run={run} next={session} />
            <Bento
              L={L}
              variant="done"
              done={done}
              target={plan.days}
              run={run}
              areas={plan.areas}
              last={last}
              bodyGlows={bodyGlows}
              now={now}
              isPremium={isPremium}
              programmeDays={programmeDays}
              onProgramme={openProgramme}
            />
          </>
        ) : (
          <>
            {hero}
            <Bento
              L={L}
              done={done}
              target={plan.days}
              run={run}
              areas={plan.areas}
              last={last}
              bodyGlows={bodyGlows}
              now={now}
              isPremium={isPremium}
              programmeDays={programmeDays}
              onProgramme={openProgramme}
            />
          </>
        )
      ) : (
        <>
          {session ? (
            <>
              <T variant="bodyStrong" color={L.ink} style={styles.ask}>
                How&apos;s your body today?
              </T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.chips}>
                {ANSWERS.map((c) =>
                  look === 'current' ? (
                    <OptionPill
                      key={c.key}
                      label={c.label}
                      icon={c.icon}
                      selected={answer === c.key}
                      onPress={() => (answer === c.key ? setAnswer(null) : pick(c.key))}
                      style={styles.chip}
                    />
                  ) : (
                    <LookChip key={c.key} L={L} label={c.label} icon={c.icon} selected={answer === c.key} onPress={() => (answer === c.key ? setAnswer(null) : pick(c.key))} />
                  ),
                )}
              </ScrollView>
            </>
          ) : null}

          {hero}

          <View style={styles.sectionHead}>
            <T variant="kicker" color={L.accent}>
              This week
            </T>
            <T variant="smallStrong" color={L.ink} style={styles.tabular}>{`${done} of ${plan.days} done`}</T>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`This week, ${done} of ${plan.days}`} onPress={() => router.navigate('/progress')} style={styles.week}>
            <WeekStrip
              days={days}
              size={36}
              tone={look === 'current' ? undefined : { ink: L.ink, muted: L.faint, done: L.bright, onDone: L.onBright, glow: L.weekGlow }}
            />
          </Pressable>

          <View style={[styles.rule, { backgroundColor: L.rule }]} />

          <View style={styles.sectionHead}>
            <T variant="kicker" color={L.accent}>
              Your body this week
            </T>
            <Pressable accessibilityRole="button" onPress={() => router.push('/edit-areas')} hitSlop={8}>
              <T variant="smallStrong" color={L.ink}>
                Edit areas
              </T>
            </Pressable>
          </View>
          <View style={styles.body}>
            <BodyFigure height={196} glows={bodyGlows} fill={L.figureFill} glowColor={L.glow} />
            <View style={styles.areaList}>
              {plan.areas.map((a) => (
                <Pressable
                  key={a}
                  accessibilityRole="button"
                  accessibilityLabel={AREA_NAMES[a]}
                  onPress={() => router.push({ pathname: '/area/[id]', params: { id: a } })}
                  style={({ pressed }) => [styles.areaRow, pressed && { opacity: 0.7 }]}
                >
                  <AreaIcon area={a} size={34} color={look === 'current' ? colors.green : L.accent} />
                  <View style={styles.flex}>
                    <T variant="bodyStrong" color={L.ink} style={{ fontSize: 15 }}>
                      {AREA_NAMES[a]}
                    </T>
                    <T variant="caption" color={L.muted} style={{ fontSize: 12 }}>
                      {last[a] ? relativeDay(last[a], now) : 'Not trained yet'}
                    </T>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.rule, { backgroundColor: L.rule }]} />

          <View style={styles.sectionHead}>
            <T variant="kicker" color={L.accent}>
              Programmes
            </T>
            {isPremium ? null : (
              <View style={styles.premiumLine}>
                <Icon name="lock" size={11} color={L.muted} strokeWidth={2.4} />
                <T variant="caption" color={L.muted}>
                  Premium
                </T>
              </View>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.programmes}>
            {PROGRAMMES.map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={p.title}
                onPress={() => openProgramme(p.id)}
                style={({ pressed }) => [styles.programme, pressed && { opacity: 0.8 }]}
              >
                <PoseBubble pose={p.pose} size={44} color={REGION_COLORS[p.areas[0]]} dot={false} />
                <View>
                  <T variant="bodyStrong" color={L.ink} style={{ fontSize: 15 }}>
                    {p.title}
                  </T>
                  <T variant="caption" color={L.muted} style={{ fontSize: 12 }}>
                    {isPremium && programmeDays[p.id] ? `Day ${Math.min(p.days, programmeDays[p.id] + 1)} of ${p.days}` : p.meta}
                  </T>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <PremiumSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Adjust today’s session?"
        body="Premium reshapes today’s session to how you feel: gentler when you’re sore, shorter when you’re busy."
        highlight={session?.areas[0]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bleed: { marginHorizontal: -24 },
  flat: { boxShadow: 'none' },
  tabular: { fontVariant: ['tabular-nums'] },
  protoRow: { paddingHorizontal: 24, paddingBottom: 8, alignItems: 'center', gap: 6 },
  protoLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2, marginRight: 2, width: 56 },
  protoDivider: { width: 1, height: 18, marginHorizontal: 4 },
  header: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  date: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  day: { fontSize: 26, lineHeight: 30, marginTop: 1 },
  insight: { marginTop: 6 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streak: { height: 38, paddingHorizontal: 13, borderRadius: 19, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5, boxShadow: shadows.small },
  streakText: { fontFamily: fonts.bold, fontSize: 15, fontVariant: ['tabular-nums'] },
  profile: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.small },
  ask: { marginTop: 22 },
  chips: { paddingHorizontal: 24, paddingVertical: 10, gap: 8 },
  chip: { minHeight: 38, paddingHorizontal: 15 },
  sectionHead: { marginTop: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  week: { marginTop: 12 },
  rule: { marginTop: 26, height: StyleSheet.hairlineWidth },
  body: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 20 },
  areaList: { flex: 1, gap: 12 },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  programmes: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, gap: 18 },
  programme: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
