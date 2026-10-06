import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton, Segments } from './ui';

/** Back button plus the 4-step progress bar used during onboarding. */
export function OnboardingHeader({ step }: { step?: number }) {
  return (
    <View style={styles.row}>
      <IconButton icon="back" label="Back" onPress={() => router.back()} style={styles.back} />
      {step ? <Segments count={4} filled={step} /> : <View style={{ flex: 1 }} />}
      <View style={{ width: 34 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 44 },
  back: { marginLeft: -6, backgroundColor: 'transparent', borderWidth: 0 },
});
