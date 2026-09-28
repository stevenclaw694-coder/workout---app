# Workout

A personal workout app that runs in the browser and installs on your phone's home screen. It works offline.

- **Routines** from the posters: The Rock's Chest & Shoulders, Legs, and Back & Abs, plus Ryan Reynolds' Legs & Abs.
- **Set logging**: weight and reps for each set. Each set is prefilled from last time so you know what to beat.
- **Rest timer** starts on its own when you tick off a set. You can adjust it by ±15s or skip it.
- **Timed holds** for planks: a 5-second get-ready, then a countdown.
- **HIIT timer**, two ways:
  - **Pick a routine** (e.g. Monday → Chest & Shoulders) to get a timed version of that workout. It goes exercise by exercise, and every set gets a work countdown and then a rest countdown. During each rest you log weight × reps for the set you just did. You set the work time per set, rest between sets, and rest between exercises. The session is saved to History like a normal workout.
  - **No routine** gives a plain interval timer (work / rest × sets) with presets: Tabata, 40/20, 30/30, EMOM.
- **Exercise library**: two-frame photo, short description, form cues, and your last and best sets.
- Beeps, vibration, and the screen stays awake during workouts.

No build step: it's plain HTML, CSS and JS modules.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Put it on your phone

1. On GitHub, go to **Settings → Pages → Build and deployment**. Set Source to **Deploy from a branch**, then pick `main` and `/ (root)`.
2. After a minute, open `https://stevenclaw694-coder.github.io/workout---app/` on your phone.
3. Install it. In Chrome: ⋮ menu → **Add to home screen** → **Install**. In Samsung Internet: ☰ menu → **Add page to** → **Home screen**.
   It then opens full-screen like a normal app and works offline.

On a foldable (e.g. Galaxy Z Fold), the cover screen uses the phone layout. The unfolded inner screen switches to two columns, with the photo beside the set log.

## Your data

Your workout log is stored **only in that browser** (localStorage) and is never uploaded. Use **History → Export backup** now and then. Import merges a backup back in.

Uninstalling the app or clearing the browser's site data erases the log.

## Editing routines

All exercises and routines are in `js/data.js`. To add an exercise:

1. Add an entry with a `src` taken from [free-exercise-db](https://github.com/yuhonas/free-exercise-db/tree/main/exercises).
2. Run `python3 tools/fetch_images.py` (needs Pillow) to download its photos.
3. Add the exercise to a routine's `items`.

After you change app files, bump `SHELL` in `sw.js` so installed copies refresh.

## Notes

- The Reynolds poster labels one exercise "Incline Press", but its drawing shows a rear-foot-elevated split squat. The app uses **Bulgarian Split Squat** for it.
- Beeps need one tap in the app before they can play (a browser rule), and they won't play while the screen is off. The app keeps the screen awake during workouts and HIIT to avoid that. On Android, the timers also vibrate.
- Photos: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), released into the public domain (Unlicense).
