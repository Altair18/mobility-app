import * as AppleAuthentication from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Ring } from '@/components/Ring';
import { T } from '@/components/T';
import { Card, IconButton, PrimaryButton, Screen, SecondaryButton, TextButton } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts } from '@/constants/theme';
import { appleSignInAvailable, emailAccount, isValidEmail, signInWithApple } from '@/lib/auth';
import { continueFirstRun } from '@/lib/flow';
import { thisWeek, weekNumber } from '@/lib/progress';
import { useAppStore } from '@/store/useAppStore';

export default function SaveProgress() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const account = useAppStore((s) => s.account);
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const setAccount = useAppStore((s) => s.setAccount);
  const setFlag = useAppStore((s) => s.setFlag);
  const [apple, setApple] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    appleSignInAvailable().then(setApple);
    if (!editing) setFlag('seenSave');
  }, [editing, setFlag]);

  const done = () => (editing ? router.back() : continueFirstRun('save'));

  const withApple = async () => {
    try {
      const result = await signInWithApple();
      if (result) {
        setAccount(result);
        done();
      }
    } catch {
      setError('Sign in with Apple did not work. Try again or use email.');
    }
  };

  if (editing && account) {
    return (
      <Screen>
        <IconButton icon="back" label="Back" onPress={() => router.back()} />
        <T variant="title" style={styles.editTitle}>
          Account
        </T>
        <Card style={styles.accountCard}>
          <T variant="caption">{account.provider === 'apple' ? 'Signed in with Apple' : 'Signed in with email'}</T>
          <T variant="bodyStrong" style={{ marginTop: 4 }}>
            {account.email ?? account.name ?? 'Apple account'}
          </T>
        </Card>
        <T variant="caption" style={styles.accountNote}>
          Your plan and progress are saved on this phone.
        </T>
        <View style={styles.flex} />
        <SecondaryButton label="Sign out" onPress={() => setAccount(null)} />
      </Screen>
    );
  }

  const week = plan ? thisWeek(history, new Date()).length : 0;
  const last = history[0];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        {editing ? <IconButton icon="back" label="Back" onPress={() => router.back()} /> : null}
        <View style={styles.stage}>
          {plan && !emailMode ? (
            <Card big style={styles.progressCard}>
              <View style={styles.cardTop}>
                <T variant="kicker">{`Week ${weekNumber(plan, new Date())}`}</T>
                <Ring size={40} stroke={5} progress={week / plan.days} />
              </View>
              <T variant="stat" style={styles.cardStat}>
                {`${week} of ${plan.days}`}
              </T>
              <T variant="caption">sessions done</T>
              <View style={styles.flex} />
              {last ? (
                <View style={styles.lastRow}>
                  <View style={styles.tick}>
                    <Icon name="check" size={12} color={colors.white} strokeWidth={3.2} />
                  </View>
                  <T variant="smallStrong" numberOfLines={1}>
                    {last.title}
                  </T>
                </View>
              ) : null}
            </Card>
          ) : null}
        </View>

        <T variant="title" center style={styles.title}>
          Save your progress
        </T>
        <T variant="body" color={colors.muted} center style={styles.sub}>
          So your plan and sessions stay with you.
        </T>

        <View style={styles.buttons}>
          {emailMode ? (
            <>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
                placeholder="you@example.com"
                placeholderTextColor={colors.faint}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                autoFocus
                style={styles.input}
                accessibilityLabel="Email address"
              />
              <PrimaryButton
                label="Continue"
                disabled={!isValidEmail(email)}
                onPress={() => {
                  setAccount(emailAccount(email));
                  done();
                }}
              />
            </>
          ) : (
            <>
              {apple ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={28}
                  style={styles.apple}
                  onPress={withApple}
                />
              ) : null}
              <SecondaryButton label="Continue with email" icon="mail" onPress={() => setEmailMode(true)} />
            </>
          )}
          {error ? (
            <T variant="caption" center color="#9A3412">
              {error}
            </T>
          ) : null}
          <TextButton label={emailMode ? 'Back' : 'Not now'} onPress={() => (emailMode ? setEmailMode(false) : done())} />
        </View>
        <T variant="caption" center style={styles.legal}>
          By continuing you agree to our{' '}
          <T variant="caption" color={colors.ink} style={styles.link} onPress={() => Linking.openURL(config.links.terms)}>
            Terms
          </T>{' '}
          and{' '}
          <T variant="caption" color={colors.ink} style={styles.link} onPress={() => Linking.openURL(config.links.privacy)}>
            Privacy Policy
          </T>
          .
        </T>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  accountNote: { marginTop: 12, paddingHorizontal: 4 },
  flex: { flex: 1 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressCard: { width: 268, height: 184, paddingVertical: 20, paddingHorizontal: 22 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardStat: { marginTop: 2, fontSize: 32, lineHeight: 36 },
  lastRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tick: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 38 },
  sub: { marginTop: 10, alignSelf: 'center', maxWidth: 290 },
  buttons: { marginTop: 30, gap: 10 },
  apple: { height: 56, width: '100%' },
  input: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,253,249,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.18)',
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.ink,
  },
  legal: { marginTop: 6, fontSize: 12 },
  link: { fontSize: 12, textDecorationLine: 'underline' },
  editTitle: { marginTop: 16 },
  accountCard: { marginTop: 20, padding: 18 },
});
