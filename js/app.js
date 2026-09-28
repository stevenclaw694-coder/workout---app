import { EXERCISES, ROUTINES, HIIT_PRESETS, img } from './data.js';
import * as store from './store.js';
import * as sound from './sound.js';
import { Countdown, fmt } from './timer.js';

const $app = document.getElementById('app');
const $sheet = document.getElementById('sheet');
const $overlay = document.getElementById('overlay');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const routineById = (id) => ROUTINES.find((r) => r.id === id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const dateStr = (t) => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const timeStr = (t) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const daysAgo = (t) => {
  const d = Math.floor((startOfDay(Date.now()) - startOfDay(t)) / 864e5);
  return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
};
const startOfDay = (t) => new Date(t).setHours(0, 0, 0, 0);
const target = (it) => (it.secs ? `${it.sets} × ${it.secs}s` : `${it.sets} × ${it.reps === 'max' ? 'to failure' : it.reps.replace('-', '–') + ' reps'}`);
const repGuess = (reps) => (reps === 'max' ? '' : String(reps).split('-').pop());
const unit = () => store.getSettings().unit;

// Two photos stacked; a global ticker alternates them to show start/end position.
const photo = (id, cls = '') => `<div class="photo ${cls}"><img src="${img(id, 0)}" alt="" loading="lazy"><img class="b" src="${img(id, 1)}" alt="" loading="lazy"></div>`;
setInterval(() => document.body.classList.toggle('f1'), 1300);

// ---------------------------------------------------------------- router

const routes = [
  [/^#?\/?$/, viewHome],
  [/^#\/routine\/([\w-]+)$/, viewRoutine],
  [/^#\/workout$/, viewWorkout],
  [/^#\/hiit$/, viewHiit],
  [/^#\/library$/, viewLibrary],
  [/^#\/ex\/([\w-]+)$/, viewExercise],
  [/^#\/history$/, viewHistory],
  [/^#\/session\/([\w-]+)$/, viewSession],
];

function render() {
  const hash = location.hash || '#/';
  for (const [re, view] of routes) {
    const m = hash.match(re);
    if (m) {
      view(...m.slice(1));
      const tab = { '#/hiit': 'hiit', '#/library': 'library', '#/history': 'history' }[hash]
        || (hash.startsWith('#/ex/') ? 'library' : hash.startsWith('#/session/') ? 'history' : 'home');
      document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
      document.body.classList.toggle('in-workout', hash === '#/workout');
      return;
    }
  }
  location.hash = '#/';
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
document.addEventListener('pointerdown', sound.unlockAudio, { capture: true });

// ---------------------------------------------------------------- home

function viewHome() {
  const active = store.getActive();
  const history = store.getHistory();
  $app.innerHTML = `
    <header class="top"><h1>Workouts</h1></header>
    <div class="cards">
    ${active ? `
      <a class="card resume" href="#/workout">
        <div><div class="eyebrow">In progress</div><strong>${esc(active.name)}</strong>
        <div class="muted">Started ${timeStr(active.start)} · ${doneSets(active)} sets done</div></div>
        <span class="btn">Resume</span>
      </a>` : ''}
    ${ROUTINES.map((r) => {
      const last = store.lastDoneRoutine(r.id, history);
      return `
      <a class="card routine" href="#/routine/${r.id}">
        <div class="thumbs">${r.items.slice(0, 3).map((it) => `<img src="${img(it.ex)}" alt="" loading="lazy">`).join('')}</div>
        <div class="grow">
          <div class="eyebrow">${esc(r.source)} · ${esc(r.day)}</div>
          <strong>${esc(r.name)}</strong>
          <div class="muted">${r.items.length} exercises · rest ${r.restNote || r.rest + 's'}${last ? ` · last ${daysAgo(last)}` : ''}</div>
        </div>
        <span class="chev">›</span>
      </a>`;
    }).join('')}
    <a class="card routine" href="#/hiit">
      <div class="thumbs icon">⏱️</div>
      <div class="grow"><div class="eyebrow">Intervals</div><strong>HIIT Timer</strong>
      <div class="muted">Tabata, 40/20, EMOM, or a routine as a circuit</div></div>
      <span class="chev">›</span>
    </a>
    </div>`;
}

// ---------------------------------------------------------------- routine

function viewRoutine(id) {
  const r = routineById(id);
  if (!r) return (location.hash = '#/');
  $app.innerHTML = `
    <header class="top"><a class="back" href="#/">‹</a><div><div class="eyebrow">${esc(r.source)} · ${esc(r.day)}</div><h1>${esc(r.name)}</h1></div></header>
    <p class="muted pad">${r.items.length} exercises · rest ${r.restNote || r.rest + 's'} between sets</p>
    <div class="list">
      ${r.items.map((it, i) => `
        <a class="row" href="#/ex/${it.ex}">
          <img class="thumb" src="${img(it.ex)}" alt="" loading="lazy">
          <div class="grow"><strong>${i + 1}. ${esc(EXERCISES[it.ex].name)}</strong><div class="muted">${target(it)}</div></div>
          <span class="chev">›</span>
        </a>`).join('')}
    </div>
    <div class="actions sticky">
      <button class="btn primary big" id="start">Start workout</button>
      <button class="btn big" id="circuit">Start with HIIT timer</button>
    </div>`;
  $app.querySelector('#start').onclick = () => startWorkout(r);
  $app.querySelector('#circuit').onclick = () => {
    const s = store.getSettings();
    useRoutineInHiit(s.hiit, r);
    store.saveSettings(s);
    location.hash = '#/hiit';
  };
}

function startWorkout(r) {
  const active = store.getActive();
  if (active && !confirm(`Discard the in-progress "${active.name}" workout?`)) return;
  store.setActive(newWorkout(r));
  location.hash = '#/workout';
}

function newWorkout(r) {
  const history = store.getHistory();
  return {
    id: uid(), routineId: r.id, name: r.name, start: Date.now(), idx: 0, rest: r.rest,
    items: r.items.map((it) => {
      const last = store.lastSetsFor(it.ex, history);
      return {
        ex: it.ex, reps: it.reps || null, secs: it.secs || null,
        sets: Array.from({ length: it.sets }, (_, i) => {
          const prev = last?.sets[Math.min(i, last.sets.length - 1)];
          return {
            w: prev?.w ?? '',
            r: '',
            s: it.secs ? String(prev?.s || it.secs) : '',
            prev: prev ? prevLabel(prev) : '',
            done: false,
          };
        }),
      };
    }),
  };
}

const prevLabel = (s) => (s.s ? `${s.s}s` : `${s.w ? s.w + '×' : ''}${s.r || '—'}`);
const doneSets = (w) => w.items.reduce((n, it) => n + it.sets.filter((s) => s.done).length, 0);

// ---------------------------------------------------------------- active workout

let elapsedTimer = null;

function viewWorkout() {
  const w = store.getActive();
  if (!w) return (location.hash = '#/');
  sound.keepAwake(true);
  const it = w.items[w.idx];
  const ex = EXERCISES[it.ex];
  const u = unit();
  const allDone = it.sets.every((s) => s.done);

  $app.innerHTML = `
    <header class="top workout-top">
      <button class="iconbtn" id="quit" aria-label="Discard workout">✕</button>
      <div class="grow center"><strong>${esc(w.name)}</strong><div class="muted" id="elapsed">${fmt((Date.now() - w.start) / 1000)}</div></div>
      <button class="btn primary" id="finish">Finish</button>
    </header>
    <div class="chips" id="chips">
      ${w.items.map((x, i) => {
        const d = x.sets.filter((s) => s.done).length;
        return `<button class="chip ${i === w.idx ? 'on' : ''} ${d === x.sets.length ? 'done' : ''}" data-i="${i}">${i + 1}. ${esc(EXERCISES[x.ex].name)}</button>`;
      }).join('')}
    </div>
    <div class="wbody">
    <section class="excard">
      ${photo(it.ex, 'large')}
      <div class="pad">
        <div class="eyebrow">Exercise ${w.idx + 1} of ${w.items.length}</div>
        <h2>${esc(ex.name)}</h2>
        <div class="target">${target({ sets: it.sets.length, reps: it.reps, secs: it.secs })} · rest ${w.rest}s</div>
        <details class="howto"><summary>How to</summary>
          <p>${esc(ex.desc)}</p>
          <ul>${ex.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
          <p class="muted small">${esc(ex.muscles)} · ${esc(ex.equipment)}</p>
        </details>
      </div>
    </section>
    <div class="wsets">
    <table class="sets">
      <thead><tr><th>Set</th><th>Last</th>${it.secs ? '<th>Seconds</th>' : `<th>${u}</th><th>Reps</th>`}<th></th></tr></thead>
      <tbody>
        ${it.sets.map((s, i) => `
          <tr class="${s.done ? 'done' : ''}" data-i="${i}">
            <td>${i + 1}</td>
            <td class="muted">${esc(s.prev) || '—'}</td>
            ${it.secs
              ? `<td><input data-f="s" inputmode="numeric" type="number" min="1" value="${esc(s.s)}"></td>`
              : `<td><input data-f="w" inputmode="decimal" type="number" step="any" min="0" placeholder="—" value="${esc(s.w)}"></td>
                 <td><input data-f="r" inputmode="numeric" type="number" min="0" placeholder="${esc(repGuess(it.reps))}" value="${esc(s.r)}"></td>`}
            <td>${it.secs && !s.done
              ? `<button class="check go" data-hold="${i}" aria-label="Start hold">▶</button>`
              : `<button class="check ${s.done ? 'on' : ''}" data-done="${i}" aria-label="Mark set done">✓</button>`}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="pad setbtns">
      <button class="link" id="addset">+ Add set</button>
      ${it.sets.length > 1 ? '<button class="link" id="rmset">− Remove set</button>' : ''}
    </div>
    <div class="actions navbtns">
      <button class="btn big" id="prev" ${w.idx === 0 ? 'disabled' : ''}>‹ Prev</button>
      <button class="btn big ${allDone ? 'primary' : ''}" id="next">${w.idx === w.items.length - 1 ? 'Finish' : 'Next ›'}</button>
    </div>
    </div>
    </div>`;

  clearInterval(elapsedTimer);
  elapsedTimer = setInterval(() => {
    const el = document.getElementById('elapsed');
    if (!el) return clearInterval(elapsedTimer);
    el.textContent = fmt((Date.now() - w.start) / 1000);
  }, 1000);

  const chip = $app.querySelector('.chip.on');
  chip?.scrollIntoView({ inline: 'center', block: 'nearest' });

  const save = () => store.setActive(w);
  const go = (i) => { w.idx = i; save(); viewWorkout(); window.scrollTo(0, 0); };

  $app.querySelector('#chips').onclick = (e) => {
    const b = e.target.closest('[data-i]');
    if (b) go(Number(b.dataset.i));
  };
  $app.querySelector('#prev').onclick = () => go(w.idx - 1);
  $app.querySelector('#next').onclick = () => (w.idx < w.items.length - 1 ? go(w.idx + 1) : finishWorkout());
  $app.querySelector('#finish').onclick = finishWorkout;
  $app.querySelector('#quit').onclick = () => {
    if (!confirm('Discard this workout? Nothing will be saved.')) return;
    endWorkout();
    location.hash = '#/';
  };
  $app.querySelector('#addset').onclick = () => {
    const lastSet = it.sets[it.sets.length - 1];
    it.sets.push({ w: lastSet.w, r: '', s: lastSet.s, prev: '', done: false });
    save(); viewWorkout();
  };
  const rm = $app.querySelector('#rmset');
  if (rm) rm.onclick = () => { it.sets.pop(); save(); viewWorkout(); };

  $app.querySelector('.sets').addEventListener('input', (e) => {
    const inp = e.target.closest('input');
    if (!inp) return;
    const i = Number(inp.closest('tr').dataset.i);
    it.sets[i][inp.dataset.f] = inp.value;
    // Carry a new weight forward to later sets that haven't been done yet.
    if (inp.dataset.f === 'w') {
      for (let j = i + 1; j < it.sets.length; j++) {
        if (!it.sets[j].done) {
          it.sets[j].w = inp.value;
          const other = $app.querySelector(`tr[data-i="${j}"] input[data-f="w"]`);
          if (other) other.value = inp.value;
        }
      }
    }
    save();
  });

  $app.querySelector('.sets').addEventListener('click', (e) => {
    const done = e.target.closest('[data-done]');
    const hold = e.target.closest('[data-hold]');
    if (done) {
      const i = Number(done.dataset.done);
      const s = it.sets[i];
      if (s.done) { s.done = false; save(); return viewWorkout(); }
      if (!it.secs && s.r === '') s.r = repGuess(it.reps);
      s.done = true;
      save();
      afterSet(w, it, i);
    } else if (hold) {
      const i = Number(hold.dataset.hold);
      const secs = Math.max(1, Number(it.sets[i].s) || it.secs);
      runHold(ex.name, secs, () => {
        it.sets[i].s = String(secs);
        it.sets[i].done = true;
        save();
        afterSet(w, it, i);
      });
    }
  });
}

function afterSet(w, it, i) {
  viewWorkout();
  const moreHere = it.sets.some((s) => !s.done);
  const isLastExercise = w.idx === w.items.length - 1;
  if (!moreHere && isLastExercise && w.items.every((x) => x.sets.every((s) => s.done))) {
    sound.finish();
    return;
  }
  let next;
  if (moreHere) {
    const n = it.sets.findIndex((s) => !s.done);
    next = `Set ${n + 1} of ${it.sets.length} · ${EXERCISES[it.ex].name}`;
  } else if (!isLastExercise) {
    next = `Next exercise: ${EXERCISES[w.items[w.idx + 1].ex].name}`;
  }
  startRest(w.rest, next, !moreHere && !isLastExercise ? () => {
    w.idx += 1; store.setActive(w);
    if (location.hash === '#/workout') { viewWorkout(); window.scrollTo(0, 0); }
  } : null);
}

// Rest timer: bottom sheet so you can still edit sets while it runs.
let rest = null;
function startRest(seconds, nextLabel, advance) {
  rest?.stop();
  $sheet.hidden = false;
  $sheet.className = 'rest';
  $sheet.innerHTML = `
    <div class="bar"><i></i></div>
    <div class="restrow">
      <div><div class="eyebrow">Rest</div><div class="big-time" id="rt">${fmt(seconds)}</div></div>
      <div class="grow muted small">${esc(nextLabel || '')}</div>
    </div>
    <div class="restbtns">
      <button class="btn" data-a="-15">−15</button>
      <button class="btn" data-a="15">+15</button>
      ${advance ? '<button class="btn" data-a="go">Next ›</button>' : ''}
      <button class="btn primary" data-a="skip">Skip</button>
    </div>`;
  const $t = $sheet.querySelector('#rt');
  const $bar = $sheet.querySelector('.bar i');
  const close = () => { rest?.stop(); rest = null; $sheet.hidden = true; };
  rest = new Countdown({
    onTick: (sec, p) => { $t.textContent = fmt(sec); $bar.style.width = `${Math.min(100, p * 100)}%`; },
    onDone: () => {
      sound.go();
      $sheet.classList.add('over');
      $t.textContent = 'Go!';
      setTimeout(() => { if (!rest) close(); }, 2500);
      rest = null;
    },
  });
  rest.start(seconds);
  $sheet.onclick = (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    if (a === 'skip') close();
    else if (a === 'go') { close(); advance?.(); }
    else rest?.add(Number(a));
  };
}

// Timed hold (planks): full-screen 5s get-ready, then the hold.
function runHold(name, secs, onDone) {
  let phase = 'ready';
  $overlay.hidden = false;
  $overlay.className = 'ready';
  $overlay.innerHTML = `
    <div class="ov-label" id="ol">Get ready</div>
    <div class="ov-name">${esc(name)}</div>
    <div class="ov-time" id="ot">5</div>
    <div class="ov-btns"><button class="btn big" id="ocancel">Cancel</button></div>`;
  const $t = $overlay.querySelector('#ot');
  const close = () => { cd.stop(); $overlay.hidden = true; };
  const cd = new Countdown({
    onTick: (s) => { $t.textContent = phase === 'ready' ? s : fmt(s); },
    onDone: () => {
      if (phase === 'ready') {
        phase = 'hold';
        sound.go();
        $overlay.className = 'work';
        $overlay.querySelector('#ol').textContent = 'Hold';
        cd.start(secs);
      } else {
        sound.stop();
        close();
        onDone();
      }
    },
  });
  cd.start(5);
  $overlay.querySelector('#ocancel').onclick = close;
}

function finishWorkout() {
  const w = store.getActive();
  if (!w) return;
  const n = doneSets(w);
  if (n === 0) {
    if (confirm('No sets are marked done. Discard this workout?')) { endWorkout(); location.hash = '#/'; }
    return;
  }
  const total = w.items.reduce((a, it) => a + it.sets.length, 0);
  if (n < total && !confirm(`${n} of ${total} sets done. Finish and save anyway?`)) return;
  const session = toSession(w);
  store.addSession(session);
  endWorkout();
  sound.finish();
  location.hash = `#/session/${session.id}`;
}

function toSession(w, extra = {}) {
  return {
    id: w.id, type: 'routine', routineId: w.routineId, name: w.name, start: w.start, end: Date.now(),
    entries: w.items.map((it) => ({
      ex: it.ex,
      sets: it.sets.filter((s) => s.done).map((s) => (it.secs ? { s: Number(s.s) } : { w: s.w === '' ? '' : Number(s.w), r: Number(s.r) || 0 })),
    })).filter((e) => e.sets.length),
    ...extra,
  };
}

function endWorkout() {
  store.clearActive();
  rest?.stop(); rest = null;
  $sheet.hidden = true;
  sound.keepAwake(false);
}

// ---------------------------------------------------------------- HIIT
// Two modes:
//  - No routine: a plain interval timer (work / rest × sets).
//  - Routine picked: a timed version of that workout. Every set of every exercise gets a
//    work countdown, then a rest countdown where you log weight × reps for the set just done.

function useRoutineInHiit(c, r) {
  c.routine = r.id;
  c.rest = Math.max(5, r.rest);
  if (c.work < 30) c.work = 40;
}

function timedPlan(c, r) {
  const ph = [];
  if (c.prep) ph.push({ kind: 'prep', dur: c.prep, item: 0, set: 0 });
  r.items.forEach((it, i) => {
    for (let s = 0; s < it.sets; s++) {
      ph.push({ kind: 'work', dur: it.secs || c.work, item: i, set: s });
      const lastSet = s === it.sets - 1;
      if (lastSet && i === r.items.length - 1) break;
      ph.push({
        kind: 'rest', dur: lastSet ? c.exRest : c.rest,
        item: lastSet ? i + 1 : i, set: lastSet ? 0 : s + 1, // what's coming next
        log: { item: i, set: s }, // the set just finished
      });
    }
  });
  return ph;
}

function plainPlan(c) {
  const ph = [];
  if (c.prep) ph.push({ kind: 'prep', dur: c.prep, set: 0 });
  for (let i = 0; i < c.rounds; i++) {
    ph.push({ kind: 'work', dur: c.work, set: i });
    if (c.rest > 0 && i < c.rounds - 1) ph.push({ kind: 'rest', dur: c.rest, set: i + 1 });
  }
  return ph;
}

function viewHiit() {
  const s = store.getSettings();
  const c = s.hiit;
  const r = routineById(c.routine);
  const phases = r ? timedPlan(c, r) : plainPlan(c);
  const total = phases.reduce((a, p) => a + p.dur, 0);
  const stepper = (key, label, step, min, max) => `
    <div class="stepper">
      <div class="muted small">${label}</div>
      <div class="stepctl">
        <button class="iconbtn" data-k="${key}" data-d="${-step}" data-min="${min}" data-max="${max}">−</button>
        <div class="val">${key === 'rounds' ? c[key] : fmt(c[key])}</div>
        <button class="iconbtn" data-k="${key}" data-d="${step}" data-min="${min}" data-max="${max}">+</button>
      </div>
    </div>`;

  $app.innerHTML = `
    <header class="top"><h1>HIIT Timer</h1></header>
    <label class="field pad">
      <span class="muted small">Workout</span>
      <select id="routine">
        <option value="">None: plain interval timer</option>
        ${ROUTINES.map((x) => `<option value="${x.id}" ${x.id === c.routine ? 'selected' : ''}>${esc(x.day)} · ${esc(x.name)} (${esc(x.source)})</option>`).join('')}
      </select>
    </label>
    ${r ? `
      <div class="steppers">
        ${stepper('work', 'Work per set', 5, 10, 300)}
        ${stepper('rest', 'Rest between sets', 5, 5, 300)}
        ${stepper('exRest', 'Rest between exercises', 15, 5, 600)}
        ${stepper('prep', 'Get ready', 5, 0, 60)}
      </div>
      <p class="pad small muted">Log weight and reps during each rest. Planks use their own hold time.</p>
      <div class="list">
        ${r.items.map((it, i) => `
          <div class="row">
            <img class="thumb" src="${img(it.ex)}" alt="" loading="lazy">
            <div class="grow"><strong>${i + 1}. ${esc(EXERCISES[it.ex].name)}</strong><div class="muted small">${target(it)}</div></div>
          </div>`).join('')}
      </div>`
    : `
      <div class="chips wrap pad">
        ${HIIT_PRESETS.map((p, i) => `<button class="chip ${p.work === c.work && p.rest === c.rest && p.rounds === c.rounds ? 'on' : ''}" data-p="${i}">${esc(p.name)}</button>`).join('')}
      </div>
      <div class="steppers">
        ${stepper('work', 'Work', 5, 5, 600)}
        ${stepper('rest', 'Rest', 5, 0, 600)}
        ${stepper('rounds', 'Sets', 1, 1, 99)}
        ${stepper('prep', 'Get ready', 5, 0, 60)}
      </div>`}
    <div class="total pad"><span class="muted">Total</span> <strong>${fmt(total)}</strong></div>
    <div class="actions sticky"><button class="btn primary big" id="go">Start</button></div>`;

  const save = () => { store.saveSettings(s); viewHiit(); };
  $app.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
    const k = b.dataset.k;
    c[k] = Math.min(Number(b.dataset.max), Math.max(Number(b.dataset.min), c[k] + Number(b.dataset.d)));
    save();
  }));
  $app.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => {
    const p = HIIT_PRESETS[Number(b.dataset.p)];
    Object.assign(c, { work: p.work, rest: p.rest, rounds: p.rounds });
    save();
  }));
  $app.querySelector('#routine').onchange = (e) => {
    const nr = routineById(e.target.value);
    if (nr) useRoutineInHiit(c, nr); else c.routine = '';
    save();
  };
  $app.querySelector('#go').onclick = () => (r ? runTimedRoutine({ ...c }, r) : runPlainHiit({ ...c }));
}

// Shared full-screen runner. `screen(p)` returns the HTML for a phase; `hooks` handle the rest.
function runPhases(phases, { screen, onEnter, onLeave, onFinish }) {
  let idx = 0;
  let cd = null;
  const remainingAfter = (i) => phases.slice(i + 1).reduce((a, p) => a + p.dur, 0);
  const label = { prep: 'Get ready', work: 'Work', rest: 'Rest' };

  sound.keepAwake(true);
  $overlay.hidden = false;
  document.body.classList.add('no-scroll');

  function show() {
    const p = phases[idx];
    onEnter?.(p);
    $overlay.className = p.kind === 'prep' ? 'ready' : p.kind;
    $overlay.innerHTML = `
      <div class="ov-top"><span>${screen.top(p)}</span><span id="ototal"></span></div>
      <div class="ov-label">${label[p.kind]}</div>
      ${screen.body(p)}
      <div class="ov-time" id="ot">${fmt(p.dur)}</div>
      <div class="bar"><i id="obar"></i></div>
      <div class="ov-btns">
        <button class="btn big" id="oprev" aria-label="Previous">⏮</button>
        <button class="btn big primary" id="opause">Pause</button>
        <button class="btn big" id="onext" aria-label="Skip">⏭</button>
      </div>
      <button class="link ov-end" id="oend">End workout</button>`;
    screen.bind?.(p);
    const $t = $overlay.querySelector('#ot');
    const $bar = $overlay.querySelector('#obar');
    const $total = $overlay.querySelector('#ototal');
    cd?.stop();
    cd = new Countdown({
      onTick: (sec, prog) => {
        $t.textContent = fmt(sec);
        $bar.style.width = `${Math.min(100, prog * 100)}%`;
        $total.textContent = `${fmt(sec + remainingAfter(idx))} left`;
      },
      onDone: () => move(1, true),
    });
    cd.start(p.dur);
    $overlay.querySelector('#opause').onclick = (e) => {
      if (cd.isPaused) { cd.resume(); e.target.textContent = 'Pause'; } else { cd.pause(); e.target.textContent = 'Resume'; }
    };
    $overlay.querySelector('#onext').onclick = () => move(1, false);
    $overlay.querySelector('#oprev').onclick = () => move(idx > 0 ? -1 : 0, false);
    $overlay.querySelector('#oend').onclick = () => { if (confirm('End this workout?')) finish(false); };
  }

  function move(d, natural) {
    onLeave?.(phases[idx], d);
    idx += d;
    if (idx >= phases.length) return finish(true);
    if (natural) (phases[idx].kind === 'work' ? sound.go : sound.stop)();
    show();
  }

  function finish(complete) {
    cd?.stop();
    if (complete) sound.finish();
    $overlay.className = 'ready';
    onFinish(complete, phases.slice(0, complete ? phases.length : idx));
  }

  function close() {
    $overlay.hidden = true;
    document.body.classList.remove('no-scroll');
    sound.keepAwake(!!store.getActive());
  }

  show();
  return { close };
}

function runPlainHiit(c) {
  const started = Date.now();
  const runner = runPhases(plainPlan(c), {
    screen: { top: (p) => `Set ${p.set + 1} / ${c.rounds}`, body: () => '' },
    onFinish: (complete, done) => {
      const setsDone = done.filter((p) => p.kind === 'work').length;
      if (setsDone > 0) {
        store.addSession({
          id: uid(), type: 'hiit', name: `HIIT ${c.work}/${c.rest}`, routineId: null,
          start: started, end: Date.now(), hiit: { ...c, roundsDone: setsDone }, entries: [],
        });
      }
      $overlay.innerHTML = `
        <div class="ov-label">${complete ? 'Done! 🎉' : 'Stopped'}</div>
        <div class="ov-name">${setsDone} of ${c.rounds} sets · ${fmt((Date.now() - started) / 1000)}</div>
        <div class="ov-btns"><button class="btn big primary" id="oclose">Close</button></div>`;
      $overlay.querySelector('#oclose').onclick = () => runner.close();
    },
  });
}

function runTimedRoutine(c, r) {
  const w = newWorkout(r);
  w.name = `${r.name} · HIIT`;
  const u = unit();
  const n = w.items.length;
  const itemAt = (p) => w.items[p.item];
  const exName = (it) => esc(EXERCISES[it.ex].name);
  const goal = (it) => (it.secs ? `Hold ${it.secs}s` : it.reps === 'max' ? 'Max reps' : `${it.reps.replace('-', '–')} reps`);

  // Weight typed for a set carries forward to that exercise's later sets.
  const setWeight = (it, from, v) => { for (let j = from; j < it.sets.length; j++) if (j === from || !it.sets[j].done) it.sets[j].w = v; };

  const logRow = (it, si) => (it.secs ? '' : `
    <div class="ov-log">
      <div class="small">Log set ${si + 1}: ${exName(it)}</div>
      <div class="ov-inputs">
        <input data-log="w" inputmode="decimal" type="number" step="any" min="0" placeholder="—" value="${esc(it.sets[si].w)}"><span>${u} ×</span>
        <input data-log="r" inputmode="numeric" type="number" min="0" placeholder="${esc(repGuess(it.reps))}" value="${esc(it.sets[si].r)}"><span>reps</span>
      </div>
    </div>`);
  const bindLog = (it, si) => {
    $overlay.querySelectorAll('[data-log]').forEach((inp) => {
      inp.oninput = () => (inp.dataset.log === 'w' ? setWeight(it, si, inp.value) : (it.sets[si].r = inp.value));
    });
  };
  const nextWeightRow = (it, si) => (it.secs ? '' : `
    <div class="ov-log"><div class="ov-inputs">
      <span class="small">Weight for set ${si + 1}</span>
      <input data-next="w" inputmode="decimal" type="number" step="any" min="0" placeholder="—" value="${esc(it.sets[si].w)}"><span>${u}</span>
    </div></div>`);

  const runner = runPhases(timedPlan(c, r), {
    screen: {
      top: (p) => `Exercise ${p.item + 1}/${n} · Set ${p.set + 1}/${itemAt(p).sets.length}`,
      body: (p) => {
        const it = itemAt(p);
        const s = it.sets[p.set];
        if (p.kind === 'work') {
          return `${photo(it.ex, 'ov-photo')}
            <div class="ov-name">${exName(it)}</div>
            <div class="ov-sub">${goal(it)}${!it.secs && s.w !== '' ? ` · ${esc(s.w)} ${u}` : ''}</div>`;
        }
        const newExercise = p.kind === 'prep' || p.log?.item !== p.item;
        return `
          ${p.log ? logRow(w.items[p.log.item], p.log.set) : ''}
          ${newExercise ? photo(it.ex, 'ov-photo small') : ''}
          <div class="ov-name">Next: ${exName(it)}</div>
          <div class="ov-sub">Set ${p.set + 1} of ${it.sets.length} · ${goal(it)}</div>
          ${newExercise ? nextWeightRow(it, p.set) : ''}`;
      },
      bind: (p) => {
        if (p.log) bindLog(w.items[p.log.item], p.log.set);
        const nx = $overlay.querySelector('[data-next]');
        if (nx) nx.oninput = () => setWeight(itemAt(p), p.set, nx.value);
      },
    },
    onEnter: (p) => { if (p.kind === 'work') itemAt(p).sets[p.set].done = false; },
    onLeave: (p, d) => {
      if (p.kind !== 'work' || d <= 0) return;
      const it = itemAt(p);
      it.sets[p.set].done = true;
      if (it.secs) it.sets[p.set].s = String(p.dur);
    },
    onFinish: (complete, done) => {
      const lastWork = [...done].reverse().find((p) => p.kind === 'work');
      const lastIt = lastWork && itemAt(lastWork);
      const setsDone = doneSets(w);
      $overlay.innerHTML = `
        <div class="ov-label">${complete ? 'Done! 🎉' : 'Stopped'}</div>
        <div class="ov-name">${setsDone} sets · ${fmt((Date.now() - w.start) / 1000)}</div>
        ${lastIt && lastIt.sets[lastWork.set].done ? logRow(lastIt, lastWork.set) : ''}
        <div class="ov-btns">
          ${setsDone ? '<button class="btn big" id="odiscard">Discard</button><button class="btn big primary" id="osave">Save</button>'
            : '<button class="btn big primary" id="odiscard">Close</button>'}
        </div>`;
      if (lastIt) bindLog(lastIt, lastWork.set);
      $overlay.querySelector('#odiscard').onclick = () => {
        if (setsDone && !confirm('Discard this workout? Nothing will be saved.')) return;
        runner.close();
      };
      const $save = $overlay.querySelector('#osave');
      if ($save) $save.onclick = () => {
        // Sets logged without reps get the target rep count.
        for (const it of w.items) for (const s of it.sets) if (s.done && !it.secs && s.r === '') s.r = repGuess(it.reps);
        const session = toSession(w, { timed: { work: c.work, rest: c.rest, exRest: c.exRest } });
        store.addSession(session);
        runner.close();
        location.hash = `#/session/${session.id}`;
      };
    },
  });
}

// ---------------------------------------------------------------- library

let libQuery = '';
function viewLibrary() {
  const all = Object.entries(EXERCISES).sort((a, b) => a[1].name.localeCompare(b[1].name));
  $app.innerHTML = `
    <header class="top"><h1>Exercises</h1></header>
    <div class="pad"><input id="q" type="search" placeholder="Search name or muscle…" value="${esc(libQuery)}"></div>
    <div class="list" id="exlist"></div>`;
  const $list = $app.querySelector('#exlist');
  const draw = () => {
    const q = libQuery.trim().toLowerCase();
    const hits = all.filter(([, e]) => !q || (e.name + ' ' + e.muscles + ' ' + e.equipment).toLowerCase().includes(q));
    $list.innerHTML = hits.map(([id, e]) => `
      <a class="row" href="#/ex/${id}">
        <img class="thumb" src="${img(id)}" alt="" loading="lazy">
        <div class="grow"><strong>${esc(e.name)}</strong><div class="muted small">${esc(e.muscles)}</div></div>
        <span class="chev">›</span>
      </a>`).join('') || '<p class="pad muted">No matches.</p>';
  };
  $app.querySelector('#q').oninput = (e) => { libQuery = e.target.value; draw(); };
  draw();
}

function viewExercise(id) {
  const e = EXERCISES[id];
  if (!e) return (location.hash = '#/library');
  const history = store.getHistory();
  const last = store.lastSetsFor(id, history);
  const best = store.bestSetFor(id, history);
  const inRoutines = ROUTINES.filter((r) => r.items.some((it) => it.ex === id));
  const u = unit();
  const setTxt = (s) => (s.s ? `${s.s}s` : `${s.w !== '' && s.w != null ? `${s.w} ${u} × ` : ''}${s.r}`);
  $app.innerHTML = `
    <header class="top"><a class="back" href="#/library" onclick="if (history.length > 1) { history.back(); return false; }">‹</a><h1>${esc(e.name)}</h1></header>
    <div class="exdetail">
    ${photo(id, 'large')}
    <div class="pad">
      <p>${esc(e.desc)}</p>
      <h3>Form cues</h3>
      <ul>${e.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <dl class="facts">
        <dt>Muscles</dt><dd>${esc(e.muscles)}</dd>
        <dt>Equipment</dt><dd>${esc(e.equipment)}</dd>
        <dt>In routines</dt><dd>${inRoutines.map((r) => {
          const it = r.items.find((x) => x.ex === id);
          return `<a href="#/routine/${r.id}">${esc(r.source)}: ${esc(r.name)}</a> (${target(it)})`;
        }).join('<br>')}</dd>
      </dl>
      <h3>Your log</h3>
      ${last ? `
        <p><span class="muted">Last (${dateStr(last.date)}):</span> ${last.sets.map(setTxt).join(', ')}</p>
        <p><span class="muted">Best set:</span> ${setTxt(best)} <span class="muted small">(${dateStr(best.date)})</span></p>`
        : '<p class="muted">Not logged yet.</p>'}
    </div>
    </div>`;
}

// ---------------------------------------------------------------- history & settings

function viewHistory() {
  const h = store.getHistory();
  const s = store.getSettings();
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = h.filter((x) => x.start >= weekAgo).length;
  $app.innerHTML = `
    <header class="top"><h1>History</h1></header>
    <div class="stats pad">
      <div><strong>${thisWeek}</strong><span class="muted small">last 7 days</span></div>
      <div><strong>${h.length}</strong><span class="muted small">total sessions</span></div>
    </div>
    <div class="list">
      ${h.map((x) => `
        <a class="row" href="#/session/${x.id}">
          <div class="grow"><strong>${esc(x.name)}</strong>
          <div class="muted small">${dateStr(x.start)} · ${fmt((x.end - x.start) / 1000)}${x.type === 'hiit' ? ` · ${x.hiit.roundsDone} sets` : ` · ${x.entries.reduce((a, e) => a + e.sets.length, 0)} sets`}</div></div>
          <span class="chev">›</span>
        </a>`).join('') || '<p class="pad muted">No workouts yet. Go lift something.</p>'}
    </div>
    <h2 class="pad">Settings</h2>
    <div class="settings pad">
      <label class="toggle"><span>Weight unit</span>
        <select id="unit"><option ${s.unit === 'lb' ? 'selected' : ''}>lb</option><option ${s.unit === 'kg' ? 'selected' : ''}>kg</option></select></label>
      <label class="toggle"><span>Sounds</span><input type="checkbox" id="snd" ${s.sound ? 'checked' : ''}></label>
      <label class="toggle"><span>Vibration</span><input type="checkbox" id="vib" ${s.vibrate ? 'checked' : ''}></label>
      <p class="muted small">Your log lives only in this browser on this device. Export a backup now and then.</p>
      <div class="actions">
        <button class="btn" id="export">Export backup</button>
        <label class="btn">Import backup<input type="file" id="import" accept="application/json,.json" hidden></label>
      </div>
      <p class="muted small">Exercise photos: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener">free-exercise-db</a> (public domain).</p>
    </div>`;
  const upd = (fn) => { const x = store.getSettings(); fn(x); store.saveSettings(x); };
  $app.querySelector('#unit').onchange = (e) => upd((x) => (x.unit = e.target.value));
  $app.querySelector('#snd').onchange = (e) => upd((x) => (x.sound = e.target.checked));
  $app.querySelector('#vib').onchange = (e) => upd((x) => (x.vibrate = e.target.checked));
  $app.querySelector('#export').onclick = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $app.querySelector('#import').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const n = store.importJSON(await f.text());
      alert(`Imported ${n} sessions.`);
      viewHistory();
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  };
}

function viewSession(id) {
  const x = store.getSession(id);
  if (!x) return (location.hash = '#/history');
  const u = unit();
  const volume = x.entries.reduce((a, e) => a + e.sets.reduce((b, s) => b + (Number(s.w) || 0) * (Number(s.r) || 0), 0), 0);
  $app.innerHTML = `
    <header class="top"><a class="back" href="#/history">‹</a><div><div class="eyebrow">${dateStr(x.start)} · ${timeStr(x.start)}</div><h1>${esc(x.name)}</h1></div></header>
    <div class="stats pad">
      <div><strong>${fmt((x.end - x.start) / 1000)}</strong><span class="muted small">duration</span></div>
      ${x.type === 'hiit'
        ? `<div><strong>${x.hiit.roundsDone}/${x.hiit.rounds}</strong><span class="muted small">sets (${x.hiit.work}s / ${x.hiit.rest}s)</span></div>`
        : `<div><strong>${x.entries.reduce((a, e) => a + e.sets.length, 0)}</strong><span class="muted small">sets</span></div>
           ${volume ? `<div><strong>${Math.round(volume).toLocaleString()}</strong><span class="muted small">${u} volume</span></div>` : ''}`}
    </div>
    <div class="list">
      ${x.entries.map((e) => `
        <a class="row" href="#/ex/${e.ex}">
          <img class="thumb" src="${img(e.ex)}" alt="" loading="lazy">
          <div class="grow"><strong>${esc(EXERCISES[e.ex]?.name || e.ex)}</strong>
          <div class="muted small">${e.sets.map((s) => (s.s ? `${s.s}s` : `${s.w !== '' && s.w != null ? s.w + '×' : ''}${s.r}`)).join(' · ')}</div></div>
        </a>`).join('')}
    </div>
    <div class="actions pad"><button class="btn danger" id="del">Delete session</button></div>`;
  $app.querySelector('#del').onclick = () => {
    if (!confirm('Delete this session from your history?')) return;
    store.deleteSession(id);
    location.hash = '#/history';
  };
}

// ---------------------------------------------------------------- boot

store.requestPersist();
if (store.getActive()) sound.keepAwake(true);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then(() => {
    // Warm the offline cache with every exercise photo.
    const urls = Object.keys(EXERCISES).flatMap((id) => [img(id, 0), img(id, 1)]);
    caches.open('wk-img-v1').then((c) => c.addAll(urls)).catch(() => {});
  }).catch(() => {});
}
