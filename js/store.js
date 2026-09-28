// Everything is saved in this browser's localStorage. Use Export in History to back it up.
const K = { history: 'wk.history', active: 'wk.active', settings: 'wk.settings' };

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const DEFAULT_SETTINGS = {
  unit: 'lb',
  sound: true,
  vibrate: true,
  hiit: { work: 20, rest: 10, rounds: 8, prep: 10, routine: '' },
};

export function getSettings() {
  const s = read(K.settings, {});
  return { ...DEFAULT_SETTINGS, ...s, hiit: { ...DEFAULT_SETTINGS.hiit, ...(s.hiit || {}) } };
}
export const saveSettings = (s) => write(K.settings, s);

export const getHistory = () => read(K.history, []);
export const getSession = (id) => getHistory().find((s) => s.id === id);
export function addSession(session) {
  const h = getHistory();
  h.unshift(session);
  return write(K.history, h);
}
export const deleteSession = (id) => write(K.history, getHistory().filter((s) => s.id !== id));

export const getActive = () => read(K.active, null);
export const setActive = (w) => write(K.active, w);
export function clearActive() {
  try { localStorage.removeItem(K.active); } catch { /* ignore */ }
}

// Completed sets from the most recent session that included this exercise.
export function lastSetsFor(exId, history = getHistory()) {
  for (const s of history) {
    const e = (s.entries || []).find((e) => e.ex === exId && e.sets.length);
    if (e) return { date: s.start, sets: e.sets };
  }
  return null;
}

export function bestSetFor(exId, history = getHistory()) {
  let best = null;
  for (const s of history) {
    for (const e of s.entries || []) {
      if (e.ex !== exId) continue;
      for (const set of e.sets) {
        const score = set.s ? set.s : (Number(set.w) || 0) * 1000 + (Number(set.r) || 0);
        if (!best || score > best.score) best = { ...set, score, date: s.start };
      }
    }
  }
  return best;
}

export function lastDoneRoutine(routineId, history = getHistory()) {
  const s = history.find((s) => s.routineId === routineId);
  return s ? s.start : null;
}

export function exportJSON() {
  return JSON.stringify({ app: 'workout', version: 1, exported: new Date().toISOString(),
    settings: getSettings(), history: getHistory() }, null, 2);
}

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.history)) throw new Error('Not a workout backup file');
  const byId = new Map(getHistory().map((s) => [s.id, s]));
  for (const s of data.history) byId.set(s.id, s);
  const merged = [...byId.values()].sort((a, b) => b.start - a.start);
  write(K.history, merged);
  if (data.settings) saveSettings({ ...getSettings(), ...data.settings });
  return data.history.length;
}

// Ask the browser not to evict our data under storage pressure.
export function requestPersist() {
  try { navigator.storage?.persist?.(); } catch { /* ignore */ }
}
