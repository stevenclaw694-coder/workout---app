// Exercise library and routines.
// Photos: free-exercise-db (github.com/yuhonas/free-exercise-db), public domain (Unlicense).
// `src` is the dataset id each photo pair came from (see tools/fetch-images.sh).

export const EXERCISES = {
  // ---- Chest & shoulders ----
  'incline-press': {
    name: 'Incline Bench Press', src: 'Barbell_Incline_Bench_Press_-_Medium_Grip',
    muscles: 'Upper chest, front delts, triceps', equipment: 'Barbell, incline bench',
    desc: 'Pressing a barbell from an incline (about 30–45°) to emphasize the upper chest.',
    cues: ['Shoulder blades pinched and down', 'Lower to upper chest, elbows ~45° from torso', 'Press up and slightly back over the shoulders'],
  },
  'db-chest-fly': {
    name: 'Dumbbell Chest Fly', src: 'Dumbbell_Flyes',
    muscles: 'Chest, front delts', equipment: 'Dumbbells, flat bench',
    desc: 'A wide arcing motion on a flat bench that stretches and squeezes the chest.',
    cues: ['Slight, fixed bend in the elbows', 'Lower until you feel a stretch, not pain', 'Hug a big tree on the way up'],
  },
  'bench-press': {
    name: 'Bench Press', src: 'Barbell_Bench_Press_-_Medium_Grip',
    muscles: 'Chest, front delts, triceps', equipment: 'Barbell, flat bench',
    desc: 'The classic flat barbell press for overall chest strength.',
    cues: ['Feet planted, slight arch, glutes on bench', 'Touch mid-chest under control', 'Drive the bar up in a slight arc toward the rack'],
  },
  'overhead-press': {
    name: 'Overhead Press', src: 'Dumbbell_Shoulder_Press',
    muscles: 'Shoulders, triceps, upper chest', equipment: 'Dumbbells, upright bench',
    desc: 'Seated dumbbell press from shoulder height to overhead.',
    cues: ['Back flat against the pad, core braced', 'Start with dumbbells at ear level', 'Press up and slightly in; don\'t clang at the top'],
  },
  'front-raise': {
    name: 'Front Raise', src: 'Front_Dumbbell_Raise',
    muscles: 'Front delts', equipment: 'Dumbbells',
    desc: 'Raising dumbbells straight in front of you to shoulder height.',
    cues: ['Soft elbows, palms down', 'Lift to eye level, no higher', 'No swinging; lower slowly'],
  },
  'side-raise': {
    name: 'Side Lateral Raise', src: 'Side_Lateral_Raise',
    muscles: 'Side delts', equipment: 'Dumbbells',
    desc: 'Raising dumbbells out to the sides to build shoulder width.',
    cues: ['Lead with the elbows, slight bend', 'Stop at shoulder height', 'Pinkies level with thumbs, not higher'],
  },
  'bent-over-raise': {
    name: 'Bent-Over Rear Delt Raise', src: 'Seated_Bent-Over_Rear_Delt_Raise',
    muscles: 'Rear delts, upper back', equipment: 'Dumbbells',
    desc: 'Hinged forward, raise dumbbells out to the sides to hit the back of the shoulders.',
    cues: ['Chest near thighs, flat back', 'Arms travel wide, not back toward hips', 'Squeeze at the top, light weight'],
  },
  'cable-fly': {
    name: 'Cable Fly', src: 'Cable_Crossover',
    muscles: 'Chest (inner/lower emphasis)', equipment: 'Cable crossover station',
    desc: 'Standing between two high pulleys and bringing the handles together in front of you.',
    cues: ['Staggered stance, slight forward lean', 'Fixed elbow bend throughout', 'Hands meet (or cross) in front of the hips'],
  },
  'bar-dips': {
    name: 'Bar Dips', src: 'Dips_-_Chest_Version',
    muscles: 'Lower chest, triceps, front delts', equipment: 'Parallel bars',
    desc: 'Bodyweight dips with a forward lean to bias the chest.',
    cues: ['Lean forward, elbows flare slightly', 'Lower until upper arms are about parallel', 'Push through the palms to lockout'],
  },

  // ---- Back & abs ----
  'pullups': {
    name: 'Pull-Ups', src: 'Pullups',
    muscles: 'Lats, biceps, mid back', equipment: 'Pull-up bar',
    desc: 'Overhand-grip bodyweight pull to bring your chest toward the bar.',
    cues: ['Start from a dead hang, shoulders engaged', 'Drive elbows down to your ribs', 'Chin over the bar; lower all the way'],
  },
  'lat-pulldown': {
    name: 'Lat Pull-Down', src: 'Wide-Grip_Lat_Pulldown',
    muscles: 'Lats, biceps, rear delts', equipment: 'Cable pulldown machine',
    desc: 'Pulling a wide bar down to the upper chest while seated.',
    cues: ['Thighs locked under the pad', 'Slight lean back, chest up', 'Pull to the collarbone, control the return'],
  },
  'db-row': {
    name: 'Dumbbell Row', src: 'One-Arm_Dumbbell_Row',
    muscles: 'Lats, mid back, biceps', equipment: 'Dumbbell, flat bench',
    desc: 'One-arm row with a knee and hand braced on a bench.',
    cues: ['Flat back, parallel to the floor', 'Pull the dumbbell to your hip pocket', 'Don\'t rotate the torso to cheat'],
  },
  'seated-cable-row': {
    name: 'Seated Pulley Row', src: 'Seated_Cable_Rows',
    muscles: 'Mid back, lats, biceps', equipment: 'Low cable row',
    desc: 'Seated row pulling a close-grip handle to the stomach.',
    cues: ['Tall chest, knees soft', 'Pull to the belly button, squeeze shoulder blades', 'Let arms extend fully without rounding'],
  },
  't-bar-row': {
    name: 'T-Bar Row', src: 'Bent_Over_Two-Arm_Long_Bar_Row',
    muscles: 'Mid back, lats, rear delts', equipment: 'Barbell in landmine/corner, V-handle',
    desc: 'Bent-over row with one end of a barbell anchored, pulling the loaded end to your chest.',
    cues: ['Hinge to ~45°, back flat', 'Pull toward the lower chest', 'Control the negative; don\'t bounce'],
  },
  'bb-shrug': {
    name: 'Heavy Barbell Shrug', src: 'Barbell_Shrug',
    muscles: 'Traps', equipment: 'Barbell',
    desc: 'Lifting the shoulders straight up toward the ears with a heavy bar.',
    cues: ['Arms stay straight', 'Shrug straight up, no rolling', 'Pause one second at the top'],
  },
  'rope-crunch': {
    name: 'Rope Crunch', src: 'Cable_Crunch',
    muscles: 'Abs', equipment: 'High cable, rope',
    desc: 'Kneeling crunch pulling a rope down from a high pulley.',
    cues: ['Hands by your head, hips stay still', 'Curl ribs toward pelvis', 'Round the spine; don\'t just bow at the hips'],
  },
  'bicycle-crunch': {
    name: 'Bicycle Crunch', src: 'Air_Bike',
    muscles: 'Abs, obliques', equipment: 'Bodyweight',
    desc: 'Alternating elbow-to-opposite-knee crunch with a pedaling motion.',
    cues: ['Lower back pressed to floor', 'Rotate the shoulder, not just the elbow', 'Slow and controlled; one side = one rep'],
  },
  'hanging-leg-raise': {
    name: 'Hanging Leg Raise', src: 'Hanging_Leg_Raise',
    muscles: 'Lower abs, hip flexors', equipment: 'Pull-up bar',
    desc: 'Hanging from a bar and raising the legs to hip height or higher.',
    cues: ['No swinging; start from a still hang', 'Tilt the pelvis up at the top', 'Lower slowly (bend knees to scale)'],
  },

  // ---- Legs ----
  'leg-extension': {
    name: 'Leg Extension', src: 'Leg_Extensions',
    muscles: 'Quads', equipment: 'Leg extension machine',
    desc: 'Seated machine movement straightening the knees against a pad.',
    cues: ['Knee lined up with the machine pivot', 'Squeeze quads hard at the top', 'Lower slowly, don\'t let the stack slam'],
  },
  'walking-lunge': {
    name: 'Walking Lunge', src: 'Dumbbell_Lunges',
    muscles: 'Quads, glutes, hamstrings', equipment: 'Dumbbells',
    desc: 'Continuous forward lunges holding dumbbells at your sides.',
    cues: ['Long step, torso upright', 'Back knee just kisses the floor', 'Drive through the front heel into the next step'],
  },
  'leg-press': {
    name: 'Seated Leg Press', src: 'Leg_Press',
    muscles: 'Quads, glutes', equipment: 'Leg press machine',
    desc: 'Pushing a loaded sled away with your legs from a seated/reclined position.',
    cues: ['Feet shoulder-width, mid-platform', 'Lower until knees are ~90°, hips stay down', 'Don\'t lock knees at the top'],
  },
  'hack-squat': {
    name: 'Hack Squat', src: 'Hack_Squat',
    muscles: 'Quads, glutes', equipment: 'Hack squat machine',
    desc: 'Machine squat with your back against an angled pad.',
    cues: ['Back and hips flat on the pad', 'Knees track over toes', 'Go to parallel or deeper, drive up'],
  },
  'rdl': {
    name: 'Romanian Deadlift', src: 'Romanian_Deadlift',
    muscles: 'Hamstrings, glutes, lower back', equipment: 'Barbell',
    desc: 'Hip hinge with nearly straight legs, lowering the bar down the thighs.',
    cues: ['Push hips back, soft knees', 'Bar stays against the legs', 'Stop when hamstrings are stretched; back stays flat'],
  },
  'lying-leg-curl': {
    name: 'Lying Leg Curl', src: 'Lying_Leg_Curls',
    muscles: 'Hamstrings', equipment: 'Leg curl machine',
    desc: 'Face-down machine curl bringing the heels toward the glutes.',
    cues: ['Hips pressed into the pad', 'Curl all the way up and squeeze', 'Slow 2–3 second lowering'],
  },
  'leg-abductor': {
    name: 'Leg Abductor', src: 'Thigh_Abductor',
    muscles: 'Outer glutes (glute med)', equipment: 'Hip abductor machine',
    desc: 'Seated machine pushing the knees outward against pads.',
    cues: ['Sit tall or lean slightly forward', 'Push out and pause', 'Control the return; don\'t let plates touch'],
  },
  'standing-calf-raise': {
    name: 'Standing Calf Raise', src: 'Standing_Calf_Raises',
    muscles: 'Calves (gastrocnemius)', equipment: 'Calf machine or dumbbells + step',
    desc: 'Rising onto the toes with straight knees from a stretched heel position.',
    cues: ['Full stretch at the bottom', 'Rise as high as possible, pause', 'Knees straight but not locked'],
  },
  'seated-calf-raise': {
    name: 'Seated Calf Raise', src: 'Seated_Calf_Raise',
    muscles: 'Calves (soleus)', equipment: 'Seated calf machine',
    desc: 'Calf raise with bent knees to target the deeper soleus muscle.',
    cues: ['Pad snug on lower thighs', 'Deep stretch, then full rise', 'Pause at top; no bouncing'],
  },

  // ---- Ryan Reynolds legs/abs extras ----
  'squat': {
    name: 'Barbell Back Squat', src: 'Barbell_Squat',
    muscles: 'Quads, glutes, core', equipment: 'Barbell, squat rack',
    desc: 'The foundational heavy squat with the bar across your upper back.',
    cues: ['Brace before each rep', 'Sit down between your heels, chest up', 'Hit parallel, drive up through mid-foot'],
  },
  'split-squat': {
    name: 'Bulgarian Split Squat', src: 'Split_Squat_with_Dumbbells',
    muscles: 'Quads, glutes', equipment: 'Dumbbells, bench',
    desc: 'Single-leg squat with the rear foot up on a bench. (The Reynolds poster labels this "Incline Press", but the drawing is a rear-foot-elevated split squat.)',
    cues: ['Rear foot laces-down on the bench', 'Drop straight down, front knee over toes', 'Do all reps on one leg, then switch'],
  },
  'one-leg-rdl': {
    name: 'One-Leg RDL', src: 'Kettlebell_One-Legged_Deadlift',
    muscles: 'Hamstrings, glutes, balance', equipment: 'Kettlebell or dumbbell',
    desc: 'Single-leg hip hinge reaching the weight toward the floor as the back leg rises.',
    cues: ['Hips stay square to the floor', 'Back leg and torso move as one line', 'Soft standing knee; reps per leg'],
  },
  'lateral-lunge': {
    name: 'Lateral Lunge', src: 'Barbell_Side_Split_Squat',
    muscles: 'Glutes, adductors, quads', equipment: 'Dumbbells or bodyweight',
    desc: 'Stepping out to the side and sitting into one hip while the other leg stays straight.',
    cues: ['Wide step, toes forward', 'Sit back into the hip, chest up', 'Push off to return; reps per side'],
  },
  'plank': {
    name: 'Plank', src: 'Plank', timed: true,
    muscles: 'Core', equipment: 'Bodyweight',
    desc: 'Holding a straight-body position on the forearms.',
    cues: ['Elbows under shoulders', 'Squeeze glutes, tuck the pelvis slightly', 'Straight line head to heels; breathe'],
  },
  'side-plank': {
    name: 'Side Plank', src: 'Side_Bridge', timed: true,
    muscles: 'Obliques, core', equipment: 'Bodyweight',
    desc: 'Holding a straight body sideways on one forearm. Do each side.',
    cues: ['Elbow under shoulder', 'Hips high, body in one line', 'Hold each side for the full time'],
  },
  'ab-wheel': {
    name: 'Ab Wheel', src: 'Ab_Roller',
    muscles: 'Abs, lats, core', equipment: 'Ab wheel',
    desc: 'Rolling a wheel out from the knees and pulling back with the abs.',
    cues: ['Start on knees, hips slightly flexed', 'Roll out only as far as you keep a flat back', 'Pull back with the abs, not the hips'],
  },
  'ball-climbers': {
    name: 'Ball Climbers', src: 'Mountain_Climbers',
    muscles: 'Core, shoulders, hip flexors', equipment: 'BOSU/stability ball (or floor)',
    desc: 'Mountain climbers with hands on a BOSU or ball for extra stability demand.',
    cues: ['Hands under shoulders, plank position', 'Drive knees to chest alternately', 'Keep hips level; each leg = one rep'],
  },
};

// Routines from the posters. reps: number, 'a-b' range, or 'max'. timed exercises use `secs`.
export const ROUTINES = [
  {
    id: 'rock-chest', name: 'Chest & Shoulders', source: 'The Rock', day: 'Mon / Thu', rest: 45,
    items: [
      { ex: 'incline-press', sets: 4, reps: '8-10' },
      { ex: 'db-chest-fly', sets: 4, reps: '8-10' },
      { ex: 'bench-press', sets: 4, reps: '8-10' },
      { ex: 'overhead-press', sets: 4, reps: '8-10' },
      { ex: 'front-raise', sets: 4, reps: '8-10' },
      { ex: 'side-raise', sets: 4, reps: '8-10' },
      { ex: 'bent-over-raise', sets: 4, reps: '8-10' },
      { ex: 'cable-fly', sets: 3, reps: '12' },
      { ex: 'bar-dips', sets: 4, reps: 'max' },
    ],
  },
  {
    id: 'rock-legs', name: 'Legs', source: 'The Rock', day: 'Tue', rest: 45,
    items: [
      { ex: 'leg-extension', sets: 4, reps: '20' },
      { ex: 'walking-lunge', sets: 4, reps: '20' },
      { ex: 'leg-press', sets: 4, reps: '20' },
      { ex: 'hack-squat', sets: 4, reps: '12' },
      { ex: 'rdl', sets: 4, reps: '12' },
      { ex: 'lying-leg-curl', sets: 4, reps: '12' },
      { ex: 'leg-abductor', sets: 4, reps: '12' },
      { ex: 'standing-calf-raise', sets: 3, reps: '25' },
      { ex: 'seated-calf-raise', sets: 3, reps: '25' },
    ],
  },
  {
    id: 'rock-back', name: 'Back & Abs', source: 'The Rock', day: 'Thu', rest: 45,
    items: [
      { ex: 'pullups', sets: 4, reps: '15' },
      { ex: 'lat-pulldown', sets: 4, reps: '15' },
      { ex: 'db-row', sets: 4, reps: '15' },
      { ex: 'seated-cable-row', sets: 4, reps: '12-15' },
      { ex: 't-bar-row', sets: 4, reps: '12-15' },
      { ex: 'bb-shrug', sets: 4, reps: '8-10' },
      { ex: 'rope-crunch', sets: 3, reps: '20' },
      { ex: 'bicycle-crunch', sets: 3, reps: '20' },
      { ex: 'hanging-leg-raise', sets: 3, reps: '20' },
    ],
  },
  {
    id: 'reynolds-legs', name: 'Legs & Abs', source: 'Ryan Reynolds', day: 'Tue', rest: 45, restNote: '30–60s',
    items: [
      { ex: 'squat', sets: 5, reps: '5' },
      { ex: 'split-squat', sets: 3, reps: '5' },
      { ex: 'one-leg-rdl', sets: 4, reps: '8' },
      { ex: 'lateral-lunge', sets: 3, reps: '8' },
      { ex: 'walking-lunge', sets: 3, reps: '10' },
      { ex: 'hanging-leg-raise', sets: 3, reps: '15' },
      { ex: 'plank', sets: 3, secs: 30 },
      { ex: 'side-plank', sets: 3, secs: 30 },
      { ex: 'ab-wheel', sets: 3, reps: '10-20' },
      { ex: 'ball-climbers', sets: 3, reps: '10' },
    ],
  },
];

export const HIIT_PRESETS = [
  { name: 'Tabata', work: 20, rest: 10, rounds: 8 },
  { name: '40 / 20', work: 40, rest: 20, rounds: 10 },
  { name: '30 / 30', work: 30, rest: 30, rounds: 10 },
  { name: 'EMOM 10', work: 60, rest: 0, rounds: 10 },
];

export const img = (id, frame = 0) => `img/${id}-${frame}.jpg`;
