'use strict';

const API  = `http://127.0.0.1:${window.electronAPI?.backendPort ?? 8765}`;
const CIRC = 603.19; // 2π × 96

const MODES = {
  focus:       { secs: 25 * 60, label: 'FOCUS',       sessionLabel: 'Deep Work',  bodyClass: '' },
  short_break: { secs:  5 * 60, label: 'SHORT BREAK', sessionLabel: 'Rest',       bodyClass: 'break' },
  long_break:  { secs: 15 * 60, label: 'LONG BREAK',  sessionLabel: 'Recharge',   bodyClass: 'break' },
};

// ── State ────────────────────────────────────────
const state = {
  mode:          'focus',
  totalSecs:     25 * 60,
  secsLeft:      25 * 60,
  running:       false,
  interval:      null,
  pomodoroIdx:   0,      // 0–3, position in current 4-pomodoro cycle
  startedAt:     null,   // ISO string, set when timer starts
  backendOnline: false,
};

// ── DOM ──────────────────────────────────────────
const $ = id => document.getElementById(id);
const timerDisplay = $('timerDisplay');
const sessionLabel = $('sessionLabel');
const ringProgress = $('ringProgress');
const modePill     = $('modePill');
const statusDot    = $('statusDot');
const startBtn     = $('startBtn');
const resetBtn     = $('resetBtn');
const skipBtn      = $('skipBtn');
const statSessions = $('statSessions');
const statMinutes  = $('statMinutes');
const statBreaks   = $('statBreaks');
const cycleDots    = Array.from(document.querySelectorAll('.cdot'));
const tabs         = Array.from(document.querySelectorAll('.tab'));

// ── Render ───────────────────────────────────────
function fmt(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = fmt(state.secsLeft);
  const progress = state.secsLeft / state.totalSecs;
  ringProgress.style.strokeDashoffset = CIRC * (1 - progress);
  document.title = `${fmt(state.secsLeft)} — ${MODES[state.mode].label}`;
}

function renderDots() {
  cycleDots.forEach((dot, i) => {
    dot.classList.toggle('done', i < state.pomodoroIdx);
  });
}

function renderMode(mode) {
  const m = MODES[mode];
  modePill.textContent  = m.label;
  sessionLabel.textContent = state.running ? m.sessionLabel : 'Ready';
  document.body.className  = m.bodyClass;

  tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
}

function setBackendStatus(online) {
  state.backendOnline = online;
  statusDot.className = `status-dot ${online ? 'online' : 'offline'}`;
  statusDot.title     = online ? 'Backend connected' : 'Backend offline — sessions not saved';
}

// ── Mode switch ──────────────────────────────────
function switchMode(mode, resetOnly = false) {
  clearInterval(state.interval);
  state.mode       = mode;
  state.totalSecs  = MODES[mode].secs;
  state.secsLeft   = MODES[mode].secs;
  state.running    = false;
  state.startedAt  = null;
  state.interval   = null;

  if (!resetOnly) renderMode(mode);
  startBtn.textContent = 'Start';
  sessionLabel.textContent = 'Ready';
  renderTimer();
}

// ── Tick ─────────────────────────────────────────
function tick() {
  if (state.secsLeft <= 0) {
    clearInterval(state.interval);
    state.running = false;
    onComplete();
    return;
  }
  state.secsLeft--;
  renderTimer();
}

// ── Session complete ─────────────────────────────
async function onComplete() {
  // Flash ring
  const wrap = document.querySelector('.ring-wrap');
  wrap.classList.add('flash');
  wrap.addEventListener('animationend', () => wrap.classList.remove('flash'), { once: true });

  // Notify
  if (Notification.permission === 'granted') {
    const body = state.mode === 'focus'
      ? (state.pomodoroIdx === 3 ? 'Long break time!' : 'Take a short break.')
      : 'Back to work.';
    new Notification(MODES[state.mode].label + ' complete', { body, silent: false });
  }

  // Persist
  if (state.backendOnline && state.startedAt) {
    try {
      await fetch(`${API}/focus/sessions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:         state.mode,
          duration_min: Math.round(state.totalSecs / 60),
          started_at:   state.startedAt,
          completed:    true,
        }),
      });
    } catch { /* non-critical */ }
    await loadStats();
  }

  // Advance cycle
  if (state.mode === 'focus') {
    state.pomodoroIdx = (state.pomodoroIdx + 1) % 4;
    renderDots();
    const next = state.pomodoroIdx === 0 ? 'long_break' : 'short_break';
    switchMode(next);
    renderMode(next);
  } else {
    switchMode('focus');
    renderMode('focus');
  }
}

// ── Controls ─────────────────────────────────────
function toggleStart() {
  if (state.running) {
    clearInterval(state.interval);
    state.running = false;
    startBtn.textContent = 'Resume';
    sessionLabel.textContent = 'Paused';
  } else {
    if (!state.startedAt) state.startedAt = new Date().toISOString();
    state.running = true;
    startBtn.textContent = 'Pause';
    sessionLabel.textContent = MODES[state.mode].sessionLabel;
    state.interval = setInterval(tick, 1000);
  }
}

startBtn.addEventListener('click', toggleStart);

resetBtn.addEventListener('click', () => {
  switchMode(state.mode, true);
  renderMode(state.mode);
});

skipBtn.addEventListener('click', () => {
  clearInterval(state.interval);
  state.running = false;

  if (state.mode === 'focus') {
    state.pomodoroIdx = (state.pomodoroIdx + 1) % 4;
    renderDots();
    const next = state.pomodoroIdx === 0 ? 'long_break' : 'short_break';
    switchMode(next);
    renderMode(next);
  } else {
    switchMode('focus');
    renderMode('focus');
  }
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchMode(tab.dataset.mode);
    renderMode(tab.dataset.mode);
  });
});

// ── Stats ────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch(`${API}/focus/stats/today`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return;
    const d = await res.json();
    statSessions.textContent = d.focus_sessions;
    statMinutes.textContent  = d.total_focus_minutes;
    statBreaks.textContent   = d.breaks;
    setBackendStatus(true);
  } catch {
    setBackendStatus(false);
  }
}

// ── Health poll ──────────────────────────────────
async function pollHealth() {
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(1500) });
    setBackendStatus(res.ok);
  } catch {
    setBackendStatus(false);
  }
}

// ── Init ─────────────────────────────────────────
async function init() {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (window.electronAPI?.platform === 'darwin') {
    document.querySelector('.header').style.paddingLeft = '80px';
  }

  ringProgress.style.strokeDasharray  = CIRC;
  ringProgress.style.strokeDashoffset = 0;

  renderTimer();
  renderDots();
  renderMode('focus');

  await pollHealth();
  await loadStats();

  // Keep checking backend every 30s
  setInterval(async () => {
    await pollHealth();
    if (state.backendOnline) await loadStats();
  }, 30_000);
}

init();
