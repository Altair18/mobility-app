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
    ['neck', 110, 74],
    ['shoulders', 62, 110],
    ['shoulders', 158, 110],
    ['elbows', 62, 186],
    ['elbows', 158, 186],
    ['wrists', 47, 238],
    ['wrists', 173, 238],
    ['hips', 88, 226],
    ['hips', 132, 226],
    ['knees', 88, 312],
    ['knees', 132, 312],
    ['ankles', 95, 404],
    ['ankles', 125, 404],
    ['feet', 84, 428],
    ['feet', 136, 428],
  ],
  back: [
    ['neck', 110, 74],
    ['shoulders', 62, 110],
    ['shoulders', 158, 110],
    ['elbows', 62, 186],
    ['elbows', 158, 186],
    ['wrists', 47, 238],
    ['wrists', 173, 238],
    ['upperBack', 110, 122],
    ['lowerBack', 110, 178],
    ['hips', 88, 230],
    ['hips', 132, 230],
  ],
};

/** Which areas can be seen (and lit up) from each side. */
export const VISIBLE: Record<BodyView, AreaId[]> = {
  front: ['neck', 'shoulders', 'elbows', 'wrists', 'hips', 'knees', 'ankles', 'feet'],
  back: ['neck', 'shoulders', 'elbows', 'wrists', 'upperBack', 'lowerBack', 'hips'],
};

/** Square crop [x, y, size] in figure units that frames each area, for small icons. */
export const AREA_CROP: Record<AreaId, [number, number, number]> = {
  neck: [40, 4, 140],
  shoulders: [30, 30, 160],
  elbows: [10, 86, 200],
  wrists: [10, 138, 200],
  upperBack: [40, 52, 140],
  lowerBack: [40, 108, 140],
  hips: [40, 156, 140],
  knees: [40, 242, 140],
  ankles: [40, 300, 140],
  feet: [40, 300, 140],
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

/** Line under the body map: every chosen area by name, "Lower back · Hips · Knees". */
export function selectionLabel(areas: AreaId[]): string {
  const names = sortAreas(areas).map((a) => AREA_NAMES[a]);
  if (names.length === 0) return 'Tap an area to add it';
  if (names.length === AREA_ORDER.length) return 'All 10 areas';
  return names.join(' · ');
}
