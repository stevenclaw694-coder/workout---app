// Beeps via Web Audio (must be unlocked by a tap on iOS) and vibration.
import { getSettings } from './store.js';

let ctx = null;

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* no audio */ }
}

export function beep(freq = 880, ms = 150, volume = 0.25) {
  if (!ctx || !getSettings().sound) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + ms / 1000 + 0.02);
}

export function buzz(pattern) {
  if (!getSettings().vibrate) return;
  try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
}

export const tick = () => beep(660, 120);
export const go = () => { beep(1046, 400, 0.35); buzz([200, 80, 200]); };
export const stop = () => { beep(440, 500, 0.35); buzz(400); };
export const finish = () => {
  beep(784, 150); setTimeout(() => beep(988, 150), 170); setTimeout(() => beep(1318, 450), 340);
  buzz([150, 60, 150, 60, 400]);
};

// Keep the screen on while a workout or timer is running.
let lock = null;
let wantLock = false;
export async function keepAwake(on) {
  wantLock = on;
  try {
    if (on && !lock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    } else if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch { /* not supported or denied */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wantLock) keepAwake(true);
});
