import type { AreaId, BodyView } from './types';

export const AREA_ORDER: AreaId[] = ['neck', 'shoulders', 'elbows', 'wrists', 'upperBack', 'lowerBack', 'hips', 'knees', 'ankles', 'feet'];

export const AREA_NAMES: Record<AreaId, string> = {
  neck: 'Neck',
  shoulders: 'Shoulders',
  elbows: 'Elbows',
  wrists: 'Wrists',
  upperBack: 'Upper back',
  lowerBack: 'Lower back',
  hips: 'Hips',
  knees: 'Knees',
  ankles: 'Ankles',
  feet: 'Feet',
};

/** Session titles when a session focuses on one area. */
export const FOCUS_TITLES: Record<AreaId, string> = {
  neck: 'Neck mobility',
  shoulders: 'Shoulder mobility',
  elbows: 'Elbow mobility',
  wrists: 'Wrist mobility',
  upperBack: 'Upper back mobility',
  lowerBack: 'Lower back mobility',
  hips: 'Hip mobility',
  knees: 'Knee mobility',
  ankles: 'Ankle mobility',
  feet: 'Foot mobility',
};

/** Tap targets (and the spot for a "selected" badge) on the 220 × 440 figure, per view. Paired areas have two. */
export const SPOTS: Record<BodyView, [AreaId, number, number][]> = {
  front: [
    ['neck', 110, 78],
    ['shoulders', 57, 112],
    ['shoulders', 163, 112],
    ['elbows', 46, 179],
    ['elbows', 174, 179],
    ['wrists', 37, 242],
    ['wrists', 183, 242],
    ['hips', 84, 226],
    ['hips', 136, 226],
    ['knees', 84, 328],
    ['knees', 136, 328],
    ['ankles', 90, 404],
    ['ankles', 130, 404],
    ['feet', 78, 432],
    ['feet', 142, 432],
  ],
  back: [
    ['neck', 110, 78],
    ['shoulders', 57, 112],
    ['shoulders', 163, 112],
    ['elbows', 46, 179],
    ['elbows', 174, 179],
    ['wrists', 37, 242],
    ['wrists', 183, 242],
    ['upperBack', 110, 124],
    ['lowerBack', 110, 182],
    ['hips', 84, 230],
    ['hips', 136, 230],
  ],
};

/** Which areas can be seen (and lit up) from each side. */
export const VISIBLE: Record<BodyView, AreaId[]> = {
  front: ['neck', 'shoulders', 'elbows', 'wrists', 'hips', 'knees', 'ankles', 'feet'],
  back: ['neck', 'shoulders', 'elbows', 'wrists', 'upperBack', 'lowerBack', 'hips'],
};

export function sortAreas(areas: AreaId[]): AreaId[] {
  return AREA_ORDER.filter((a) => areas.includes(a));
}

/** "Lower back + Hips", or "Neck + 2 more" for longer lists. */
export function areasLabel(areas: AreaId[]): string {
  const sorted = sortAreas(areas);
  if (sorted.length === 0) return 'Mobility';
  if (sorted.length <= 2) return sorted.map((a) => AREA_NAMES[a]).join(' + ');
  return `${AREA_NAMES[sorted[0]]} + ${sorted.length - 1} more`;
}

/** Line under the body map: "Lower back · Hips", or a count for long lists. */
export function selectionLabel(areas: AreaId[]): string {
  const names = sortAreas(areas).map((a) => AREA_NAMES[a]);
  if (names.length === 0) return 'Tap an area to add it';
  return names.length <= 3 ? names.join(' · ') : `${names.length} areas`;
}
