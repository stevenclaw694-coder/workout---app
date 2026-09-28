// Wall-clock countdown: stays accurate even if the browser throttles intervals.
import { tick } from './sound.js';

export class Countdown {
  constructor({ onTick, onDone, warn = 3 } = {}) {
    this.onTick = onTick;
    this.onDone = onDone;
    this.warn = warn;
    this.id = null;
  }

  start(seconds) {
    this.total = seconds * 1000;
    this.end = Date.now() + this.total;
    this.paused = null;
    this.lastSec = null;
    this.run();
  }

  run() {
    clearInterval(this.id);
    this.id = setInterval(() => this.step(), 100);
    this.step();
  }

  step() {
    const rem = Math.max(0, this.end - Date.now());
    const sec = Math.ceil(rem / 1000);
    if (sec !== this.lastSec) {
      if (this.lastSec !== null && sec > 0 && sec <= this.warn) tick();
      this.lastSec = sec;
    }
    this.onTick?.(sec, this.total ? 1 - rem / this.total : 1);
    if (rem <= 0) {
      this.stop();
      this.onDone?.();
    }
  }

  add(seconds) {
    if (this.paused !== null) this.paused = Math.max(1000, this.paused + seconds * 1000);
    else this.end = Math.max(Date.now() + 1000, this.end + seconds * 1000);
    this.total = Math.max(1000, this.total + seconds * 1000);
    this.step();
  }

  pause() {
    if (this.paused !== null || !this.id) return;
    this.paused = Math.max(0, this.end - Date.now());
    clearInterval(this.id);
  }

  resume() {
    if (this.paused === null) return;
    this.end = Date.now() + this.paused;
    this.paused = null;
    this.run();
  }

  get isPaused() { return this.paused !== null; }

  stop() {
    clearInterval(this.id);
    this.id = null;
  }
}

export function fmt(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
