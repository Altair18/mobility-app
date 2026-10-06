import type { AreaId, Exercise } from './types';

/**
 * Starter library: 50 moves across the 10 areas and 3 levels, at least three beginner moves per area.
 * The V1 target is ~50 reviewed moves. Add more here, using an existing pose or a new one in poses.ts.
 */
export const EXERCISES: Exercise[] = [
  // Neck
  {
    id: 'neck-tuck', name: 'Chin tucks', area: 'neck', level: 1, pose: 'chinTuck', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['everyday', 'stiffness'],
    tip: 'Draw your chin straight back, then relax.',
    steps: ['Sit or stand tall.', 'Gently draw your chin straight back.', 'Hold for a breath, then relax.'],
  },
  {
    id: 'neck-tilt', name: 'Neck side tilt', area: 'neck', level: 1, pose: 'neck', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['stiffness', 'everyday'],
    tip: 'Ear towards shoulder. Keep the other shoulder low.',
    steps: ['Sit or stand tall.', 'Tilt your ear towards your shoulder.', 'Keep the other shoulder relaxed and low.'],
  },
  {
    id: 'neck-turn', name: 'Slow neck turns', area: 'neck', level: 2, pose: 'chinTuck', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['freely', 'everyday'],
    tip: 'Turn slowly to look over each shoulder.',
    steps: ['Sit tall with relaxed shoulders.', 'Turn your head to look over one shoulder.', 'Pause, then turn slowly to the other side.'],
  },
  {
    id: 'neck-roll', name: 'Half neck circles', area: 'neck', level: 1, pose: 'neck', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['stiffness', 'everyday'],
    tip: 'Roll your chin slowly from shoulder to shoulder.',
    steps: ['Sit or stand tall.', 'Drop your chin towards your chest.', 'Roll it slowly from one shoulder to the other.'],
  },

  // Shoulders
  {
    id: 'sh-reach', name: 'Overhead reach', area: 'shoulders', level: 1, pose: 'reach', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['freely', 'flexibility', 'everyday'],
    tip: 'Reach both arms up and breathe into your sides.',
    steps: ['Stand tall, feet hip-width apart.', 'Reach both arms up overhead.', 'Breathe slowly and lengthen through your sides.'],
  },
  {
    id: 'sh-cross', name: 'Cross-body stretch', area: 'shoulders', level: 1, pose: 'armCross', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['flexibility', 'sport'],
    tip: 'Draw one arm across your chest.',
    steps: ['Bring one arm across your chest.', 'Hold it gently with your other hand.', 'Keep your shoulders down and relaxed.'],
  },
  {
    id: 'sh-rolls', name: 'Shoulder rolls', area: 'shoulders', level: 1, pose: 'chinTuck', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['stiffness', 'everyday', 'freely'],
    tip: 'Lift, roll back and drop your shoulders. Go slowly.',
    steps: ['Stand or sit with your arms relaxed.', 'Lift your shoulders up to your ears.', 'Roll them back and down. Repeat slowly.'],
  },
  {
    id: 'sh-goalpost', name: 'Goalpost arms', area: 'shoulders', level: 2, pose: 'goalpost', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['sport', 'freely'],
    tip: 'Arms in a goalpost. Raise and lower them slowly.',
    steps: ['Lift your arms into a goalpost shape.', 'Slowly raise them overhead.', 'Lower back down, keeping the shape.'],
  },
  {
    id: 'sh-sidebend', name: 'Standing side bend', area: 'shoulders', level: 2, pose: 'sideBend', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['flexibility', 'stiffness'],
    tip: 'Reach up and over. Keep both feet grounded.',
    steps: ['Stand tall and reach one arm up.', 'Lean gently to the opposite side.', 'Keep both feet grounded and breathe.'],
  },

  // Upper back
  {
    id: 'ub-catcow', name: 'Cat–cow', area: 'upperBack', level: 1, pose: 'cat', seconds: 60, eachSide: false, equipment: 'mat',
    goals: ['stiffness', 'freely', 'everyday'],
    tip: 'Round your back, then let it dip. Move with your breath.',
    steps: ['Start on hands and knees.', 'Round your back up towards the ceiling.', 'Then let your belly dip. Move with your breath.'],
  },
  {
    id: 'ub-thread', name: 'Thread the needle', area: 'upperBack', level: 2, pose: 'thread', seconds: 30, eachSide: true, equipment: 'mat',
    goals: ['flexibility', 'sport'],
    tip: 'Slide one arm under and rest your shoulder down.',
    steps: ['Start on hands and knees.', 'Slide one arm under your body.', 'Rest your shoulder and the side of your head down.'],
  },
  {
    id: 'ub-twist', name: 'Seated twist', area: 'upperBack', level: 1, pose: 'twist', seconds: 30, eachSide: true, equipment: 'mat',
    goals: ['freely', 'stiffness'],
    tip: 'Sit tall and turn gently from your mid-back.',
    steps: ['Sit tall with one knee bent.', 'Hug the knee and turn towards it.', 'Keep lengthening as you turn.'],
  },
  {
    id: 'ub-hug', name: 'Self hug', area: 'upperBack', level: 1, pose: 'armCross', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['stiffness', 'everyday'],
    tip: 'Wrap your arms around you and round your upper back.',
    steps: ['Stand or sit tall.', 'Cross your arms and hold your shoulder blades.', 'Round your upper back and breathe into it.'],
  },
  {
    id: 'ub-wall', name: 'Wall angels', area: 'upperBack', level: 2, pose: 'goalpost', seconds: 45, eachSide: false, equipment: 'wall',
    goals: ['everyday', 'sport'],
    tip: 'Back to the wall. Slide your arms up and down slowly.',
    steps: ['Stand with your back against a wall.', 'Bring your arms into a goalpost against the wall.', 'Slide them up and down without arching.'],
  },

  // Lower back
  {
    id: 'lb-child', name: "Child's pose", area: 'lowerBack', level: 1, pose: 'child', seconds: 60, eachSide: false, equipment: 'mat',
    goals: ['stiffness', 'everyday'],
    tip: 'Sit back on your heels, arms long. Breathe slowly.',
    steps: ['Kneel and sit back towards your heels.', 'Walk your hands forward, arms long.', 'Rest your forehead down and breathe slowly.'],
  },
  {
    id: 'lb-hug', name: 'Knee hug', area: 'lowerBack', level: 1, pose: 'hug', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['stiffness', 'everyday'],
    tip: 'On your back, hug both knees in and rock gently.',
    steps: ['Lie on your back.', 'Hug both knees towards your chest.', 'Rock gently from side to side.'],
  },
  {
    id: 'lb-seated', name: 'Seated reach', area: 'lowerBack', level: 1, pose: 'seated', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['flexibility'],
    tip: 'Legs long. Reach forward from your hips.',
    steps: ['Sit with your legs out in front.', 'Reach forward from your hips.', 'Keep your knees soft if you need to.'],
  },
  {
    id: 'lb-cobra', name: 'Cobra', area: 'lowerBack', level: 2, pose: 'cobra', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['flexibility', 'freely'],
    tip: 'Press up gently. Keep your hips on the floor.',
    steps: ['Lie on your front, hands under your shoulders.', 'Press up gently through your hands.', 'Keep your hips on the floor.'],
  },
  {
    id: 'lb-bridge', name: 'Glute bridge', area: 'lowerBack', level: 2, pose: 'bridge', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['sport', 'freely'],
    tip: 'Lift your hips, then lower slowly.',
    steps: ['Lie on your back, knees bent, feet flat.', 'Squeeze your glutes and lift your hips.', 'Lower slowly and repeat.'],
  },
  {
    id: 'lb-fold', name: 'Forward fold', area: 'lowerBack', level: 2, pose: 'fold', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['flexibility', 'sport'],
    tip: 'Soft knees. Let your upper body hang.',
    steps: ['Stand with your feet hip-width apart.', 'Fold forward from your hips, knees soft.', 'Let your head and arms hang.'],
  },

  // Hips
  {
    id: 'hip-butterfly', name: 'Butterfly', area: 'hips', level: 1, pose: 'butterfly', seconds: 60, eachSide: false, equipment: 'mat',
    goals: ['flexibility', 'everyday'],
    tip: 'Soles together. Let your knees fall open.',
    steps: ['Sit tall and bring the soles of your feet together.', 'Let your knees fall open.', 'Lean forward slightly if it feels good.'],
  },
  {
    id: 'hip-lunge', name: 'Low lunge', area: 'hips', level: 1, pose: 'lunge', seconds: 45, eachSide: true, equipment: 'mat',
    goals: ['freely', 'sport', 'everyday'],
    tip: 'Back knee down. Ease your hips forward.',
    steps: ['Step one foot forward and lower your back knee.', 'Keep your chest tall, hands on your front knee.', 'Ease your hips forward until you feel a gentle stretch.'],
  },
  {
    id: 'hip-fig4', name: 'Figure-four stretch', area: 'hips', level: 1, pose: 'hug', seconds: 45, eachSide: true, equipment: 'mat',
    goals: ['flexibility', 'stiffness', 'everyday'],
    tip: 'Ankle over knee. Draw your legs in gently.',
    steps: ['Lie on your back, knees bent.', 'Cross one ankle over the other knee.', 'Draw both legs towards you until you feel the hip.'],
  },
  {
    id: 'hip-swing', name: 'Leg swings', area: 'hips', level: 2, pose: 'legSwing', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['sport', 'freely'],
    tip: 'Hold on for balance and swing with control.',
    steps: ['Stand side-on to a wall and hold it.', 'Swing your outside leg forward and back.', 'Keep it smooth and controlled.'],
  },
  {
    id: 'hip-squat', name: 'Deep squat hold', area: 'hips', level: 2, pose: 'squat', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['sport', 'freely'],
    tip: 'Heels down, chest up. Hold on to something if needed.',
    steps: ['Stand with your feet a little wider than your hips.', 'Sink down into a squat, heels down.', 'Keep your chest up and breathe.'],
  },
  {
    id: 'hip-pigeon', name: 'Pigeon', area: 'hips', level: 3, pose: 'pigeon', seconds: 45, eachSide: true, equipment: 'mat',
    goals: ['flexibility', 'sport'],
    tip: 'Front shin across, back leg long. Stay tall or fold.',
    steps: ['Bring one shin forward across your mat.', 'Slide your other leg long behind you.', 'Stay tall, or fold forward over your shin.'],
  },

  // Knees
  {
    id: 'kn-quad', name: 'Standing quad stretch', area: 'knees', level: 1, pose: 'quad', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['flexibility', 'everyday'],
    tip: 'Hold one foot behind you. Keep your knees together.',
    steps: ['Stand tall and hold a wall for balance.', 'Hold one foot behind you.', 'Keep your knees together and hips forward.'],
  },
  {
    id: 'kn-hamstring', name: 'Hamstring stretch', area: 'knees', level: 1, pose: 'seated', seconds: 30, eachSide: true, equipment: 'mat',
    goals: ['flexibility', 'everyday'],
    tip: 'One leg long. Hinge forward with a long back.',
    steps: ['Sit with one leg long and the other bent.', 'Sit tall, then hinge forward from your hips.', 'Stop at a gentle stretch behind the knee.'],
  },
  {
    id: 'kn-slides', name: 'Heel slides', area: 'knees', level: 1, pose: 'hug', seconds: 30, eachSide: true, equipment: 'mat',
    goals: ['stiffness', 'everyday', 'freely'],
    tip: 'Slide your heel in and out, nice and slow.',
    steps: ['Lie on your back with your legs long.', 'Slide one heel towards you, bending the knee.', 'Slide it back out. Keep it smooth.'],
  },
  {
    id: 'kn-heelsit', name: 'Heel sit', area: 'knees', level: 2, pose: 'heelSit', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['freely', 'stiffness'],
    tip: 'Sit back towards your heels. Use a cushion if needed.',
    steps: ['Kneel with your knees together.', 'Sit back towards your heels.', 'Place a cushion behind your knees if needed.'],
  },
  {
    id: 'kn-couch', name: 'Couch stretch', area: 'knees', level: 3, pose: 'couch', seconds: 45, eachSide: true, equipment: 'wall',
    goals: ['sport', 'flexibility'],
    tip: 'Back shin up the wall. Squeeze your glute.',
    steps: ['Kneel with your back shin up a sofa or wall.', 'Bring your other foot forward.', 'Lift your chest and squeeze your glute.'],
  },

  // Ankles
  {
    id: 'an-rock', name: 'Ankle rocks', area: 'ankles', level: 1, pose: 'ankleRock', seconds: 30, eachSide: true, equipment: 'mat',
    goals: ['freely', 'sport', 'everyday'],
    tip: 'Rock your front knee over your toes, heel down.',
    steps: ['Half kneel with one foot forward.', 'Rock your front knee forward over your toes.', 'Keep your front heel down.'],
  },
  {
    id: 'an-circles', name: 'Ankle circles', area: 'ankles', level: 1, pose: 'seated', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['stiffness', 'everyday'],
    tip: 'Draw slow, big circles with your toes.',
    steps: ['Sit with one leg out in front of you.', 'Draw big, slow circles with your foot.', 'Switch direction halfway.'],
  },
  {
    id: 'an-calf', name: 'Calf stretch', area: 'ankles', level: 1, pose: 'calf', seconds: 30, eachSide: true, equipment: 'wall',
    goals: ['flexibility', 'sport', 'everyday'],
    tip: 'Back leg straight, heel down. Lean into the wall.',
    steps: ['Face a wall with your hands on it.', 'Step one foot back, keeping the heel down.', 'Lean in until you feel the calf.'],
  },
  {
    id: 'an-dog', name: 'Down dog', area: 'ankles', level: 2, pose: 'downDog', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['flexibility', 'sport'],
    tip: 'Hips high. Gently press your heels towards the floor.',
    steps: ['Start on hands and knees.', 'Lift your hips up and back.', 'Gently press your heels towards the floor.'],
  },
  {
    id: 'an-squat', name: 'Squat ankle shifts', area: 'ankles', level: 3, pose: 'squat', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['sport'],
    tip: 'In a deep squat, shift your weight slowly side to side.',
    steps: ['Sink into a deep squat.', 'Shift your weight onto one foot.', 'Then slowly shift to the other side.'],
  },

  // Elbows
  {
    id: 'el-circles', name: 'Arm circles', area: 'elbows', level: 1, pose: 'armsOut', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['freely', 'everyday', 'stiffness'],
    tip: 'Arms out wide. Draw slow circles, then change direction.',
    steps: ['Stand tall with your arms out to the sides.', 'Draw slow circles, growing a little each time.', 'Halfway through, change direction.'],
  },
  {
    id: 'el-bend', name: 'Elbow bends', area: 'elbows', level: 1, pose: 'goalpost', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['stiffness', 'everyday'],
    tip: 'Bend and straighten both arms slowly, all the way.',
    steps: ['Arms by your sides, palms forward.', 'Bend your elbows fully, hands to your shoulders.', 'Straighten slowly until your arms are long.'],
  },
  {
    id: 'el-turn', name: 'Forearm turns', area: 'elbows', level: 1, pose: 'forearmTurn', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['freely', 'everyday', 'sport'],
    tip: 'Elbows at your sides. Turn your palms up, then down.',
    steps: ['Tuck your elbows in, forearms forward.', 'Turn your palms up as far as they go.', 'Turn them down. Keep the elbows still.'],
  },
  {
    id: 'el-wall', name: 'Wall bicep stretch', area: 'elbows', level: 2, pose: 'wallArm', seconds: 30, eachSide: true, equipment: 'wall',
    goals: ['flexibility', 'sport'],
    tip: 'Arm back on the wall, palm flat. Turn your chest away.',
    steps: ['Stand side-on to a wall.', 'Reach the near arm back and press your palm flat.', 'Turn your chest away until you feel the arm.'],
  },

  // Wrists
  {
    id: 'wr-circles', name: 'Wrist circles', area: 'wrists', level: 1, pose: 'wristCircle', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['stiffness', 'everyday', 'freely'],
    tip: 'Circle both wrists slowly, then change direction.',
    steps: ['Arms out in front, hands relaxed.', 'Draw slow circles with your hands.', 'Halfway through, change direction.'],
  },
  {
    id: 'wr-prayer', name: 'Prayer stretch', area: 'wrists', level: 1, pose: 'prayer', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['flexibility', 'stiffness', 'everyday'],
    tip: 'Palms together at your chest. Lower your hands until you feel it.',
    steps: ['Press your palms together in front of your chest.', 'Keep them together and lower your hands.', 'Stop when you feel the stretch under your wrists.'],
  },
  {
    id: 'wr-pull', name: 'Wrist flexor stretch', area: 'wrists', level: 1, pose: 'fingerPull', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['flexibility', 'everyday'],
    tip: 'Arm out, palm up. Draw the fingers back gently.',
    steps: ['Reach one arm out in front, palm up.', 'With the other hand, draw the fingers back gently.', 'Keep the elbow soft and breathe.'],
  },
  {
    id: 'wr-table', name: 'Tabletop wrist rocks', area: 'wrists', level: 2, pose: 'tabletop', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['sport', 'freely'],
    tip: 'Hands flat on the floor. Rock gently forward and back.',
    steps: ['Start on hands and knees, fingers spread.', 'Rock your weight forward over your wrists.', 'Rock back. Keep your palms flat.'],
  },
  {
    id: 'wr-reverse', name: 'Reverse prayer', area: 'wrists', level: 3, pose: 'reversePrayer', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['flexibility'],
    tip: 'Palms together behind your back. Slide them up slowly.',
    steps: ['Bring your palms together behind your back, fingers down.', 'Turn the fingers up if you can.', 'Slide the hands up your back and hold.'],
  },

  // Feet
  {
    id: 'ft-spread', name: 'Toe spreads', area: 'feet', level: 1, pose: 'footFlex', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['everyday', 'freely'],
    tip: 'Spread your toes wide, hold, then relax.',
    steps: ['Sit with your legs out, feet relaxed.', 'Spread your toes as wide as they go.', 'Hold for a breath, then relax them.'],
  },
  {
    id: 'ft-flex', name: 'Foot flex and point', area: 'feet', level: 1, pose: 'footFlex', seconds: 30, eachSide: true, equipment: 'none',
    goals: ['stiffness', 'everyday'],
    tip: 'Pull your toes towards you, then point them away.',
    steps: ['Sit with one leg out in front.', 'Pull the toes back towards you.', 'Point them away. Keep it slow.'],
  },
  {
    id: 'ft-raise', name: 'Heel raises', area: 'feet', level: 1, pose: 'calfRaise', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['sport', 'everyday', 'freely'],
    tip: 'Rise onto your toes, pause, lower slowly.',
    steps: ['Stand with feet hip-width apart.', 'Rise up onto your toes and pause.', 'Lower slowly. Hold on to something if needed.'],
  },
  {
    id: 'ft-toes', name: 'Toe stretch kneel', area: 'feet', level: 2, pose: 'heelSit', seconds: 45, eachSide: false, equipment: 'mat',
    goals: ['flexibility', 'stiffness'],
    tip: 'Kneel with your toes tucked under. Sit back gently.',
    steps: ['Kneel with your toes tucked under.', 'Sit back towards your heels.', 'Ease off if it is too much.'],
  },
  {
    id: 'ft-arch', name: 'Arch lifts', area: 'feet', level: 2, pose: 'calfRaise', seconds: 45, eachSide: false, equipment: 'none',
    goals: ['sport', 'freely'],
    tip: 'Feet flat. Lift your arches without curling your toes.',
    steps: ['Stand with feet flat and toes relaxed.', 'Draw the ball of the foot towards the heel to lift the arch.', 'Hold, then relax. Keep the toes long.'],
  },
];


const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

export function exercisesForArea(area: AreaId): Exercise[] {
  return EXERCISES.filter((e) => e.area === area).sort((a, b) => a.level - b.level);
}

/** Total seconds a move takes (both sides when needed). */
export function moveSeconds(e: Exercise): number {
  return e.seconds * (e.eachSide ? 2 : 1);
}

export function durationLabel(e: Exercise): string {
  return e.eachSide ? `${e.seconds}s each side` : `${e.seconds}s`;
}

export const EQUIPMENT_LABEL: Record<Exercise['equipment'], string> = {
  none: 'No equipment',
  mat: 'Mat',
  wall: 'Wall',
};
