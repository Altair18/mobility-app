import type { CompletedSession } from '@/data/types';

import { daysBetween } from './dates';

/** One line under the greeting, built from how the last session went. Null when there's nothing useful to say. */
export function insightLine(history: CompletedSession[], isPremium: boolean, now: Date): string | null {
  const last = history[0];
  if (!last) return 'Day one. Start gently and see how it feels.';
  const days = daysBetween(new Date(last.date), now);
  if (days >= 3) return `${days} days since your last session. Ease back in.`;
  // Only Premium adapts levels to feedback, so only promise a change there.
  if (last.feedback === 'easy') return isPremium ? 'Last session felt easy, so today steps up a level.' : 'Last session felt easy. Nice work.';
  if (last.feedback === 'hard') return isPremium ? 'Last session felt hard, so today eases off.' : 'Last session felt hard. Go at your own pace today.';
  if (last.feedback === 'right') return 'Last session felt just right. More of the same today.';
  return null;
}
