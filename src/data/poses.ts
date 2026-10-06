import type { PoseKey } from './types';

/**
 * Each move is drawn as a simple figure inside a 100 × 100 box (the bubble shows 6–94).
 * torso: thick stroke · back: the limbs further from you (lighter) · limbs: nearer limbs
 * h: head centre · d: green dot on the area being stretched. The floor sits at y ≈ 82.
 */
export type Pose = {
  torso: string;
  back: string;
  limbs: string;
  h: [number, number];
  d: [number, number];
};

export const POSES: Record<PoseKey, Pose> = {
  reach: { torso: 'M50 57 L50 38', back: 'M53 57 L53 70 L53 82 M49 38 L45 27 L44 17', limbs: 'M47 57 L47 70 L47 82 M51 38 L56 27 L57 17', h: [50, 29], d: [51, 39] },
  fold: { torso: 'M46 52 L57 70', back: 'M49 52 L49 67 L49 82', limbs: 'M45 52 L45 67 L45 82 M57 70 L56 76 L55 82', h: [61, 77], d: [46, 63] },
  child: { torso: 'M31 72 Q43 62 55 72', back: 'M55 72 L69 78 L84 79', limbs: 'M31 73 L46 81 L25 82 M55 74 L68 81 L83 82', h: [61, 75], d: [41, 66] },
  cat: { torso: 'M34 55 Q48 41 62 55', back: 'M37 56 L37 82 L22 82 M59 56 L59 82', limbs: 'M33 56 L33 82 L17 82 M63 56 L63 82', h: [71, 50], d: [48, 47] },
  lunge: { torso: 'M46 60 L47 37', back: 'M46 60 L36 80 L18 82', limbs: 'M46 60 L64 62 L66 82 M47 39 L56 51 L62 58', h: [48, 27], d: [45, 60] },
  butterfly: { torso: 'M45 76 L46 52', back: 'M45 77 L33 70 L46 81', limbs: 'M45 77 L61 70 L50 81 M46 54 L50 66 L50 77', h: [47, 42], d: [55, 73] },
  cobra: { torso: 'M46 80 Q58 76 63 62', back: 'M46 80 L30 80 L14 80', limbs: 'M46 81 L30 82 L14 82 M63 63 L65 72 L66 82', h: [68, 53], d: [54, 77] },
  hug: { torso: 'M25 80 L48 80', back: 'M48 79 L40 63 L54 60', limbs: 'M48 80 L36 63 L50 59 M29 79 L32 69 L38 63', h: [16, 77], d: [45, 79] },
  seated: { torso: 'M36 79 L53 62', back: 'M36 79 L57 80 L79 81', limbs: 'M36 80 L57 81 L80 82 M53 63 L65 70 L76 77', h: [60, 56], d: [57, 81] },
  neck: { torso: 'M50 58 L50 36', back: '', limbs: 'M46 58 L45 70 L45 82 M54 58 L55 70 L55 82 M44 37 L40 50 L40 62 M56 37 L58 24 L49 17', h: [44, 25], d: [50, 32] },
  chinTuck: { torso: 'M50 57 L50 38', back: 'M53 57 L53 70 L53 82 M48 39 L46 50 L46 60', limbs: 'M47 57 L47 70 L47 82 M52 39 L54 50 L54 60', h: [48, 29], d: [50, 34] },
  armCross: { torso: 'M50 57 L50 38', back: 'M53 57 L53 70 L53 82 M49 40 L42 47 L36 42', limbs: 'M47 57 L47 70 L47 82 M52 40 L41 42 L30 41', h: [50, 29], d: [54, 39] },
  goalpost: { torso: 'M50 57 L50 38', back: 'M53 57 L53 70 L53 82 M48 40 L38 41 L37 30', limbs: 'M47 57 L47 70 L47 82 M52 40 L62 41 L63 30', h: [50, 29], d: [50, 45] },
  sideBend: { torso: 'M50 57 Q52 47 46 39', back: 'M53 57 L53 70 L53 82 M45 41 L40 50 L39 58', limbs: 'M47 57 L47 70 L47 82 M47 40 L42 28 L34 22', h: [42, 31], d: [52, 47] },
  thread: { torso: 'M34 53 Q47 52 58 68', back: 'M38 55 L38 82 L24 82 M56 66 L63 82', limbs: 'M34 55 L34 82 L20 82 M58 70 L44 79 L28 81', h: [65, 75], d: [48, 58] },
  twist: { torso: 'M44 77 L46 54', back: 'M44 78 L60 77 L74 79 M45 56 L36 66 L33 77', limbs: 'M44 78 L56 68 L52 80 M47 56 L57 63 L59 70', h: [47, 45], d: [45, 68] },
  bridge: { torso: 'M26 79 L48 66', back: 'M50 67 L62 60 L67 82 M27 79 L41 82', limbs: 'M48 66 L60 58 L64 82 M30 80 L44 83', h: [17, 77], d: [48, 67] },
  pigeon: { torso: 'M46 72 L50 50', back: 'M46 74 L30 79 L12 82', limbs: 'M46 74 L61 77 L50 82 M50 52 L56 66 L58 80', h: [52, 41], d: [47, 73] },
  legSwing: { torso: 'M48 57 L48 38', back: 'M50 57 L50 70 L50 82 M46 40 L38 47 L32 50', limbs: 'M47 58 L58 67 L68 74 M50 40 L58 46 L64 48', h: [48, 29], d: [49, 59] },
  squat: { torso: 'M44 70 L50 48', back: 'M46 71 L60 64 L57 82 M49 50 L57 60 L63 59', limbs: 'M43 71 L56 66 L52 82 M50 50 L58 58 L65 55', h: [52, 39], d: [44, 71] },
  quad: { torso: 'M50 57 L50 38', back: 'M51 40 L57 50 L58 59', limbs: 'M50 57 L50 70 L50 82 M48 58 L45 71 L37 61 M49 40 L43 51 L38 60', h: [50, 29], d: [46, 66] },
  couch: { torso: 'M46 62 L48 40', back: 'M46 63 L34 82 L28 64', limbs: 'M46 62 L62 62 L64 82 M47 42 L38 52 L30 62', h: [49, 31], d: [40, 73] },
  heelSit: { torso: 'M40 72 L42 50', back: 'M39 74 L57 80 L37 82 M41 52 L48 64 L53 74', limbs: 'M41 75 L60 81 L40 83 M42 52 L50 64 L56 74', h: [43, 41], d: [58, 80] },
  ankleRock: { torso: 'M46 62 L48 40', back: 'M46 62 L34 81 L18 82', limbs: 'M46 62 L62 61 L55 82 M48 42 L56 52 L61 58', h: [49, 31], d: [56, 79] },
  downDog: { torso: 'M52 46 L36 63', back: 'M53 47 L70 82 M37 64 L30 82', limbs: 'M51 47 L74 82 M35 64 L24 82', h: [31, 70], d: [66, 72] },
  calf: { torso: 'M46 56 L55 37', back: 'M46 57 L37.5 69.5 L29 82 M54 39 L63 41 L71 36', limbs: 'M46 57 L56 68 L55 82 M55 39 L64 45 L72 42', h: [59, 28], d: [34, 75] },
  armsOut: { torso: 'M50 57 L50 38', back: '', limbs: 'M47 57 L47 70 L47 82 M53 57 L53 70 L53 82 M48 40 L31 41 L15 41 M52 40 L69 41 L85 41', h: [50, 29], d: [31, 41] },
  wristCircle: { torso: 'M50 57 L50 38', back: '', limbs: 'M47 57 L47 70 L47 82 M53 57 L53 70 L53 82 M48 40 L31 41 L15 41 M52 40 L69 41 L85 41', h: [50, 29], d: [83, 41] },
  prayer: { torso: 'M50 57 L50 38', back: '', limbs: 'M47 57 L47 70 L47 82 M53 57 L53 70 L53 82 M47 40 L39 48 L50 51 M53 40 L61 48 L50 51', h: [50, 29], d: [50, 51] },
  reversePrayer: { torso: 'M50 57 L50 38', back: 'M48 40 L41 52 L50 58 M52 40 L59 52 L50 58', limbs: 'M47 57 L47 70 L47 82 M53 57 L53 70 L53 82', h: [50, 29], d: [50, 58] },
  fingerPull: { torso: 'M50 57 L50 38', back: 'M48 40 L58 50 L80 45', limbs: 'M47 57 L47 70 L47 82 M53 57 L53 70 L53 82 M52 40 L68 41 L84 41', h: [50, 29], d: [82, 41] },
  forearmTurn: { torso: 'M50 57 L50 38', back: '', limbs: 'M47 57 L47 70 L47 82 M53 57 L53 70 L53 82 M48 40 L45 53 L31 53 M52 40 L55 53 L69 53', h: [50, 29], d: [45, 53] },
  wallArm: { torso: 'M48 58 L52 38', back: 'M51 40 L38 44 L24 38', limbs: 'M46 58 L45 70 L44 82 M50 58 L53 70 L55 82 M52 40 L60 50 L64 60', h: [53, 29], d: [38, 44] },
  tabletop: { torso: 'M34 54 L62 54', back: 'M37 55 L37 82 L22 82 M59 55 L59 82', limbs: 'M33 55 L33 82 L17 82 M63 55 L63 82', h: [71, 49], d: [20, 81] },
  footFlex: { torso: 'M36 79 L45 60', back: 'M36 79 L57 80 L79 81', limbs: 'M36 80 L57 81 L79 80 L80 74 M45 62 L55 72 L62 78', h: [49, 52], d: [79, 78] },
  calfRaise: { torso: 'M50 54 L50 35', back: '', limbs: 'M46 54 L45 67 L44 77 L49 82 M54 54 L55 67 L56 77 L61 82 M48 37 L43 50 L41 60 M52 37 L57 50 L59 60', h: [50, 26], d: [52, 80] },
};

/**
 * The other end of the movement for moves that are best shown moving. Each frame has the same path
 * commands as its pose in POSES, so the player can blend between the two in time with the breath.
 */
export const MOTION: Partial<Record<PoseKey, Pose>> = {
  // Cat → cow: the spine sags and the head lifts.
  cat: { torso: 'M34 55 Q48 66 62 55', back: 'M37 56 L37 82 L22 82 M59 56 L59 82', limbs: 'M33 56 L33 82 L17 82 M63 56 L63 82', h: [72, 45], d: [48, 60] },
  // Forward swing → back swing, arms swapping.
  legSwing: { torso: 'M48 57 L48 38', back: 'M50 57 L50 70 L50 82 M46 40 L52 48 L58 52', limbs: 'M47 58 L38 68 L30 76 M50 40 L42 48 L36 52', h: [48, 29], d: [49, 59] },
  // The front knee rocks forward over the toes.
  ankleRock: { torso: 'M50 62 L53 40', back: 'M50 62 L36 81 L18 82', limbs: 'M50 62 L67 63 L55 82 M53 42 L60 53 L65 59', h: [54, 31], d: [56, 79] },
  // Up onto the toes.
  calfRaise: { torso: 'M50 50 L50 31', back: '', limbs: 'M46 50 L45 63 L45 74 L49 82 M54 50 L55 63 L55 74 L61 82 M48 33 L43 46 L41 56 M52 33 L57 46 L59 56', h: [50, 22], d: [52, 80] },
  // Goalpost arms press overhead.
  goalpost: { torso: 'M50 57 L50 38', back: 'M53 57 L53 70 L53 82 M48 40 L42 29 L46 18', limbs: 'M47 57 L47 70 L47 82 M52 40 L58 29 L54 18', h: [50, 29], d: [50, 45] },
  // From standing tall into the side bend.
  sideBend: { torso: 'M50 57 Q50 47 49 38', back: 'M53 57 L53 70 L53 82 M48 40 L45 50 L45 58', limbs: 'M47 57 L47 70 L47 82 M50 39 L50 28 L49 17', h: [48, 29], d: [52, 47] },
};
