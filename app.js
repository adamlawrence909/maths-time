import React, { useState, useEffect, useRef, useCallback } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';
import htm from 'https://esm.sh/htm@3';

const html = htm.bind(React.createElement);

// ═══════════════════════════════════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════

const TOTAL_Q = 20;

const THEMES = {
  boy:  { decos: ['🚀','🌙','⭐','🪐','🛸','💫','🌟','🔭'], avatar: '🧒', greeting: 'Ready to blast off?', name: 'Space Explorer' },
  girl: { decos: ['🦄','✨','🌸','🎀','⭐','💜','🌈','🦋'], avatar: '👧', greeting: 'Ready to shine?',     name: 'Magic Star' },
};

const CORRECT_MSGS   = ['⭐ Yes!', '🎉 Correct!', '💪 Right!', '🌟 Brilliant!', '🎯 Perfect!', '✅ Spot on!', '🚀 Amazing!'];
const INCORRECT_MSGS = ['Not quite… 🤔', 'Try again! 🔄', 'Have another go! 💭'];

const WORD_NUMS = {
  zero:0, nought:0, oh:0, one:1, won:1, two:2, to:2, too:2,
  three:3, free:3, four:4, for:4, fore:4, five:5, six:6,
  seven:7, eight:8, ate:8, nine:9, nein:9, ten:10, tin:10,
};

function uid()    { return Math.random().toString(36).slice(2, 10); }
function today()  { return new Date().toDateString(); }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function fmt(sec) {
  if (!sec || sec === 0) return '–:––';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function fmtRaw(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeProblems() {
  const base = [];
  for (let i = 0; i <= 10; i++)
    base.push({ given: i, answer: 10 - i, blankLeft: Math.random() < 0.5 });
  shuffle(base);
  const extras = Array.from({ length: TOTAL_Q - base.length }, () => {
    const g = Math.floor(Math.random() * 11);
    return { given: g, answer: 10 - g, blankLeft: Math.random() < 0.5 };
  });
  return shuffle([...base, ...extras]);
}

function starsFor(sec) {
  if (sec < 60)  return '⭐⭐⭐';
  if (sec < 100) return '⭐⭐⭐';
  if (sec < 150) return '⭐⭐';
  if (sec < 240) return '⭐';
  return '🌟';
}

function msgFor(sec) {
  if (sec < 60)  return "Unbelievable speed! You're a Maths Superstar! 🚀";
  if (sec < 100) return "Amazing work! Keep smashing those times!";
  if (sec < 150) return "Great job! You're getting faster every day!";
  if (sec < 240) return "Well done! Practice makes perfect!";
  return "Fantastic effort! Keep going — you've got this! 🌈";
}

// ═══════════════════════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════════════════════

function loadUsers()   { try { return JSON.parse(localStorage.getItem('ms_users') || '[]'); } catch { return []; } }
function saveUsers(u)  { localStorage.setItem('ms_users', JSON.stringify(u)); }
function loadCurrent() { return localStorage.getItem('ms_current') || null; }
function saveCurrent(id){ localStorage.setItem('ms_current', id); }

// ═══════════════════════════════════════════════════════════════════
//  CONFETTI
// ═══════════════════════════════════════════════════════════════════

function launchConfetti() {
  const cols = ['#4f46e5','#ec4899','#fbbf24','#4ade80','#60a5fa','#a78bfa','#f472b6'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = [
        `left:${Math.random() * 100}vw`, `top:-20px`,
        `width:${6 + Math.random() * 10}px`, `height:${6 + Math.random() * 10}px`,
        `background:${pick(cols)}`,
        `border-radius:${Math.random() > 0.5 ? '50%' : '3px'}`,
        `animation-duration:${1.4 + Math.random() * 2}s`,
        `animation-delay:${Math.random() * 0.5}s`,
      ].join(';');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 18);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  FLOATING DECORATIONS COMPONENT
// ═══════════════════════════════════════════════════════════════════

function DecoLayer({ gender }) {
  const decos = THEMES[gender]?.decos || THEMES.boy.decos;
  const items = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    emoji: decos[i % decos.length],
    left: (i * 6.5) % 100,
    duration: 14 + (i * 3.1) % 12,
    delay: (i * 2.3) % 10,
    size: 1.1 + (i % 4) * 0.25,
  }));

  return html`
    <div class="deco-layer">
      ${items.map(d => html`
        <div key=${d.id} class="deco" style=${{
          left: `${d.left}vw`,
          fontSize: `${d.size}rem`,
          animationDuration: `${d.duration}s`,
          animationDelay: `${d.delay}s`,
        }}>${d.emoji}</div>
      `)}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  NUMBER PAD COMPONENT
// ═══════════════════════════════════════════════════════════════════

function NumberPad({ onKey, onDelete }) {
  return html`
    <div class="numpad">
      ${[7,8,9,4,5,6,1,2,3].map(n => html`
        <button key=${n} class="nk" onclick=${() => onKey(n)}>${n}</button>
      `)}
      <button class="nk nk-ten"  onclick=${() => onKey(10)}>10</button>
      <button class="nk nk-zero" onclick=${() => onKey(0)}>0</button>
      <button class="nk nk-del"  onclick=${onDelete}>⌫</button>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  WELCOME / CREATE USER SCREEN
// ═══════════════════════════════════════════════════════════════════

function WelcomeScreen({ onDone, isAdding }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || !gender) return;
    onDone(trimmed, gender);
  }

  return html`
    <div class="screen-wrap">
      <div class="card text-center">
        <span class="welcome-emoji">${isAdding ? '➕' : '👋'}</span>
        <h2>${isAdding ? 'Add a Player' : 'Welcome to MathSmash!'}</h2>
        <p style=${{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
          ${isAdding ? 'Create a profile for the new player' : 'Set up your profile to get started'}
        </p>

        <input
          class="name-input"
          type="text"
          placeholder="Enter your name..."
          maxlength="12"
          value=${name}
          oninput=${e => setName(e.target.value)}
          onkeydown=${e => e.key === 'Enter' && handleSubmit()}
          autocomplete="off"
        />

        <div class="gender-row">
          <button
            class=${'gender-btn' + (gender === 'boy' ? ' selected' : '')}
            onclick=${() => setGender('boy')}
          >
            <span class="gender-icon">🚀</span>
            <div class="gender-label">Explorer</div>
            <div class="gender-sub">Space theme</div>
          </button>
          <button
            class=${'gender-btn' + (gender === 'girl' ? ' selected' : '')}
            onclick=${() => setGender('girl')}
          >
            <span class="gender-icon">🦄</span>
            <div class="gender-label">Magic Star</div>
            <div class="gender-sub">Rainbow theme</div>
          </button>
        </div>

        <button
          class="btn btn-primary"
          onclick=${handleSubmit}
          disabled=${!name.trim() || !gender}
          style=${{ opacity: (!name.trim() || !gender) ? 0.5 : 1 }}
        >
          ${isAdding ? '✅ Add Player' : "🎯 Let's Play!"}
        </button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  USER SWITCHER MODAL
// ═══════════════════════════════════════════════════════════════════

function UserSwitcher({ users, currentId, onSwitch, onAdd, onClose }) {
  return html`
    <div class="modal-overlay" onclick=${e => e.target === e.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-title">👥 Switch Player</div>
        <div class="user-list">
          ${users.map(u => html`
            <button
              key=${u.id}
              class=${'user-row' + (u.id === currentId ? ' active' : '')}
              onclick=${() => onSwitch(u.id)}
            >
              <span class="user-row-avatar">${THEMES[u.gender]?.avatar || '🧒'}</span>
              <span class="user-row-name">${u.name}</span>
              <span style=${{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                ${u.bestTime ? fmt(u.bestTime) : 'No plays yet'}
              </span>
              ${u.id === currentId ? html`<span class="user-row-check">✓</span>` : null}
            </button>
          `)}
        </div>
        <button class="btn btn-ghost" style=${{ width: '100%' }} onclick=${onAdd}>
          ➕ Add New Player
        </button>
        <button class="btn btn-ghost" style=${{ width: '100%', marginTop: '8px' }} onclick=${onClose}>
          Cancel
        </button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════════════════════

function HomeScreen({ user, users, currentId, onStart, onLeaderboard, onSwitchUser }) {
  const theme = THEMES[user.gender] || THEMES.boy;

  const streakMsg = (() => {
    if (user.lastPlayed === today() && user.plays > 0) return `🔥 You've already played today! Beat ${fmt(user.bestTime)}?`;
    if (user.streak > 1) return `🔥 ${user.streak}-day streak! Don't break it!`;
    if (user.plays === 0) return 'Complete your first challenge today!';
    return 'Play today to keep your streak going!';
  })();

  return html`
    <div class="screen-wrap">
      <div class="card">
        <!-- Header -->
        <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div class="app-title">MathSmash</div>
            <div class="app-sub">Friends of 10</div>
          </div>
          <button class="btn-icon" onclick=${onSwitchUser} title="Switch player">
            ${theme.avatar}
          </button>
        </div>

        <!-- Greeting -->
        <div style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
          <div style=${{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Hey ${user.name}! ${theme.greeting}
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">⏱️ BEST</div>
            <div class="stat-value">${user.bestTime ? fmt(user.bestTime) : '–:––'}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">🔥 STREAK</div>
            <div class="stat-value">${user.streak}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">✅ PLAYS</div>
            <div class="stat-value">${user.plays}</div>
          </div>
        </div>

        <div class="streak-msg">${streakMsg}</div>

        <button class="btn btn-primary" onclick=${onStart}>
          ⚡ Start Challenge!
        </button>

        <!-- How to play -->
        <div class="how-to">
          <div class="how-to-title">🎓 How to Play</div>
          <p>Two numbers that add up to <strong style=${{ color: 'var(--primary-light)' }}>10</strong> are <strong style=${{ color: 'var(--primary-light)' }}>Friends of 10!</strong></p>
          <span class="eq-example">7 + <span>__</span> = 10 → <span>3</span></span>
          <p>Solve 20 questions as fast as you can! Use the number pad, keyboard, or your voice 🎤</p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="nav-bar">
        <button class="nav-btn active">🏠 Home</button>
        <button class="nav-btn" onclick=${onLeaderboard}>🏆 Leaderboard</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  CHALLENGE SCREEN
// ═══════════════════════════════════════════════════════════════════

function ChallengeScreen({ user, onComplete, onQuit }) {
  const [questions]      = useState(() => makeProblems());
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput]   = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [micOn, setMicOn]   = useState(false);
  const [micHint, setMicHint] = useState('Tap to speak');
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked]   = useState(false); // prevents double-submit

  const timerRef  = useRef(null);
  const recogRef  = useRef(null);
  const waitRef   = useRef(null); // for "1" → wait for "10"
  const inputRef  = useRef('');

  // Keep ref in sync with state for keyboard handler
  useEffect(() => { inputRef.current = input; }, [input]);

  // ── Timer ──
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Keyboard ──
  useEffect(() => {
    function onKey(e) {
      if (locked) return;
      const cur = inputRef.current;
      if (e.key === 'Backspace') { e.preventDefault(); clearWait(); setInput(''); return; }
      if (e.key === 'Enter')     { e.preventDefault(); submitAnswer(cur); return; }
      const d = parseInt(e.key);
      if (isNaN(d)) return;
      e.preventDefault();

      // "10" detection: if waiting for zero and user presses 0
      if (waitRef.current && d === 0) {
        clearWait();
        const newVal = '10';
        setInput(newVal);
        setTimeout(() => submitAnswer(newVal), 100);
      } else {
        clearWait();
        setInput(String(d));
        if (d !== 1) {
          submitAnswer(String(d));
        } else {
          // Wait 600ms to see if "0" follows
          waitRef.current = setTimeout(() => {
            waitRef.current = null;
            submitAnswer('1');
          }, 600);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, qIndex]); // eslint-disable-line

  function clearWait() {
    if (waitRef.current) { clearTimeout(waitRef.current); waitRef.current = null; }
  }

  // ── Submit ──
  function submitAnswer(val) {
    if (locked) return;
    const v = val !== undefined ? val : input;
    if (v === '') return;
    const q = questions[qIndex];
    const given = parseInt(v);

    if (given === q.answer) {
      setFeedback({ text: pick(CORRECT_MSGS), type: 'correct' });
      setLocked(true);
      setInput('');
      const next = qIndex + 1;
      if (next >= TOTAL_Q) {
        clearInterval(timerRef.current);
        if (recogRef.current) try { recogRef.current.stop(); } catch {}
        setTimeout(() => onComplete(seconds + 1), 350);
      } else {
        setTimeout(() => {
          setFeedback({ text: '', type: '' });
          setQIndex(next);
          setLocked(false);
        }, 320);
      }
    } else {
      setFeedback({ text: pick(INCORRECT_MSGS), type: 'incorrect' });
      setInput('');
      setTimeout(() => setFeedback({ text: '', type: '' }), 550);
    }
  }

  // ── Numpad press ──
  function pressNum(n) {
    if (locked) return;
    clearWait();
    setInput(String(n));
    submitAnswer(String(n));
  }

  function pressDelete() {
    if (locked) return;
    clearWait();
    setInput('');
    setFeedback({ text: '', type: '' });
  }

  // ── Mic ──
  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (micOn) {
      try { recogRef.current?.stop(); } catch {}
      setMicOn(false);
      return;
    }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';
    r.maxAlternatives = 5;
    r.onstart  = () => { setMicOn(true);  setMicHint('🎙️ Listening…'); };
    r.onend    = () => { setMicOn(false); setMicHint('Tap to speak'); };
    r.onerror  = () => { setMicOn(false); setMicHint("Couldn't hear — try again!"); };
    r.onresult = (ev) => {
      for (let a = 0; a < ev.results[0].length; a++) {
        const text = ev.results[0][a].transcript.trim().toLowerCase();
        const m = text.match(/\b(10|[0-9])\b/);
        if (m) { const n = parseInt(m[1]); setInput(String(n)); setTimeout(() => submitAnswer(String(n)), 250); return; }
        for (const [w, num] of Object.entries(WORD_NUMS)) {
          if (text.includes(w)) { setInput(String(num)); setTimeout(() => submitAnswer(String(num)), 250); return; }
        }
      }
      setMicHint("Didn't catch that!");
    };
    recogRef.current = r;
    try { r.start(); } catch {}
  }

  const q = questions[qIndex];
  const pct = ((qIndex / TOTAL_Q) * 100).toFixed(1);
  const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const blankEl = html`
    <span class=${'blank' + (input ? ' has-value' : '')}>${input || ''}</span>
  `;
  const eq = q.blankLeft
    ? html`<div class="equation">${blankEl}<span class="eq-op">+</span><span>${q.given}</span><span class="eq-eq">=</span><span class="eq-ten">10</span></div>`
    : html`<div class="equation"><span>${q.given}</span><span class="eq-op">+</span>${blankEl}<span class="eq-eq">=</span><span class="eq-ten">10</span></div>`;

  return html`
    <div class="screen-wrap">
      <div class="card">
        <!-- Header -->
        <div class="challenge-header">
          <button class="btn-icon" onclick=${() => { if(confirm('Quit? Your time won\'t be saved.')) { clearInterval(timerRef.current); if(recogRef.current) try{recogRef.current.stop()}catch{}; onQuit(); } }}>
            ←
          </button>
          <div class="timer-display">${fmtRaw(seconds)}</div>
          <div style=${{ width: '44px' }}></div>
        </div>

        <!-- Progress -->
        <div class="progress-row">
          <span class="progress-label">Q${qIndex + 1}/${TOTAL_Q}</span>
          <div class="progress-track">
            <div class="progress-fill" style=${{ width: `${pct}%` }}></div>
          </div>
        </div>

        <!-- Equation -->
        <div class="equation-wrap">${eq}</div>

        <!-- Feedback -->
        <div class=${'feedback ' + feedback.type}>${feedback.text}</div>

        <!-- Mic -->
        ${hasSR ? html`
          <div class="mic-row">
            <button class=${'mic-btn' + (micOn ? ' on' : '')} onclick=${toggleMic}>🎤</button>
            <span class="mic-hint">${micHint}</span>
          </div>
        ` : null}

        <!-- Number pad -->
        <${NumberPad} onKey=${pressNum} onDelete=${pressDelete} />
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════

function ResultsScreen({ result, user, onRetry, onHome }) {
  const { seconds, isNew, streak } = result;

  useEffect(() => { launchConfetti(); }, []);

  return html`
    <div class="screen-wrap">
      <div class="card text-center">
        <div class="result-emoji">🎉</div>
        <div style=${{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Challenge Complete!
        </div>
        <div class="result-time">${fmtRaw(seconds)}</div>
        <div class="stars">${starsFor(seconds)}</div>

        ${isNew && result.prevBest > 0 ? html`<div class="new-best-badge">🏆 New Best Time!</div>` : null}

        <div class="result-msg">${msgFor(seconds)}</div>

        <div class="result-grid">
          <div class="result-box">
            <div class="result-box-label">🏅 Best</div>
            <div class="result-box-value">${fmt(user.bestTime)}</div>
          </div>
          <div class="result-box">
            <div class="result-box-label">🔥 Streak</div>
            <div class="result-box-value">${streak}</div>
          </div>
          <div class="result-box">
            <div class="result-box-label">✅ Plays</div>
            <div class="result-box-value">${user.plays}</div>
          </div>
        </div>

        <button class="btn btn-primary" onclick=${onRetry}>🔄 Try Again!</button>
        <button class="btn btn-ghost" style=${{ width: '100%', marginTop: '6px' }} onclick=${onHome}>🏠 Home</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  LEADERBOARD SCREEN
// ═══════════════════════════════════════════════════════════════════

function LeaderboardScreen({ users, currentId, onHome, onStart }) {
  // Sort: played users by best time, then unplayed users
  const played   = users.filter(u => u.bestTime > 0).sort((a,b) => a.bestTime - b.bestTime);
  const unplayed = users.filter(u => !u.bestTime);
  const sorted   = [...played, ...unplayed];

  const medals = ['🥇','🥈','🥉'];

  // Podium (top 3 played)
  const podiumUsers = played.slice(0, 3);
  // Reorder for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [podiumUsers[1], podiumUsers[0], podiumUsers[2]].filter(Boolean);
  const podiumClass = podiumUsers[1] ? ['podium-2','podium-1','podium-3'] : ['podium-1'];

  return html`
    <div class="screen-wrap">
      <div class="card">
        <!-- Header -->
        <div class="lb-header">
          <button class="btn-icon" onclick=${onHome}>←</button>
          <h2>🏆 Leaderboard</h2>
          <div style=${{ width: '44px' }}></div>
        </div>

        <!-- Podium (only if ≥ 1 played) -->
        ${played.length > 0 ? html`
          <div class="podium">
            ${podiumOrder.map((u, i) => html`
              <div key=${u.id} class=${'podium-slot ' + podiumClass[i]}>
                <div class="podium-avatar">${THEMES[u.gender]?.avatar || '🧒'}</div>
                <div class="podium-medal">${medals[podiumOrder.indexOf(u)]}</div>
                <div class="podium-name">${u.name}</div>
                <div class="podium-time">${fmt(u.bestTime)}</div>
              </div>
            `)}
          </div>
        ` : html`
          <div style=${{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontWeight: 700 }}>
            <div style=${{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
            No times yet! Be the first to set a score!
          </div>
        `}

        <!-- Full list -->
        <div class="lb-list">
          ${sorted.map((u, i) => {
            const rank = u.bestTime > 0 ? i + 1 : null;
            const isCurrent = u.id === currentId;
            return html`
              <div key=${u.id} class=${'lb-row' + (isCurrent ? ' current-user' : '')}>
                <div class="lb-rank">${rank ? (medals[rank-1] || `#${rank}`) : '–'}</div>
                <div class="lb-avatar">${THEMES[u.gender]?.avatar || '🧒'}</div>
                <div class="lb-info">
                  <div class="lb-name">${u.name} ${isCurrent ? '(you)' : ''}</div>
                  <div class="lb-meta">🔥 ${u.streak} streak · ✅ ${u.plays} plays</div>
                </div>
                <div class="lb-time">${u.bestTime ? fmt(u.bestTime) : '–:––'}</div>
              </div>
            `;
          })}
        </div>

        <button class="btn btn-primary" style=${{ marginTop: '16px' }} onclick=${onStart}>
          ⚡ Play Now!
        </button>
      </div>

      <div class="nav-bar">
        <button class="nav-btn" onclick=${onHome}>🏠 Home</button>
        <button class="nav-btn active">🏆 Leaderboard</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════

function App() {
  const [users,     setUsers]     = useState(() => loadUsers());
  const [currentId, setCurrentId] = useState(() => loadCurrent());
  const [screen,    setScreen]    = useState('home');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [addingUser,   setAddingUser]   = useState(false);
  const [result,   setResult]   = useState(null);

  const currentUser = users.find(u => u.id === currentId) || null;

  // Persist
  useEffect(() => saveUsers(users), [users]);
  useEffect(() => { if (currentId) saveCurrent(currentId); }, [currentId]);

  // Apply theme to <html>
  useEffect(() => {
    const g = currentUser?.gender || 'boy';
    document.documentElement.setAttribute('data-theme', g);
  }, [currentUser?.gender]);

  // First launch
  useEffect(() => {
    if (users.length === 0) setScreen('welcome');
  }, []);

  function mutUser(id, updates) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }

  function createUser(name, gender) {
    const u = { id: uid(), name, gender, bestTime: 0, streak: 0, lastPlayed: '', plays: 0 };
    setUsers(prev => [...prev, u]);
    setCurrentId(u.id);
    setAddingUser(false);
    setShowSwitcher(false);
    setScreen('home');
  }

  function handleChallengeComplete(sec) {
    if (!currentUser) return;
    const prev    = currentUser.bestTime;
    const isNew   = prev === 0 || sec < prev;
    const yest    = new Date(Date.now() - 86400000).toDateString();
    let streak    = currentUser.streak;
    if (currentUser.lastPlayed !== today()) {
      streak = currentUser.lastPlayed === yest ? streak + 1 : 1;
    }
    mutUser(currentId, {
      bestTime:   isNew ? sec : prev,
      streak,
      lastPlayed: today(),
      plays:      currentUser.plays + 1,
    });
    setResult({ seconds: sec, isNew, prevBest: prev, streak });
    setScreen('results');
  }

  // ── Render ──

  if (screen === 'welcome' || (!currentUser && !addingUser)) {
    return html`
      <${DecoLayer} gender="boy" />
      <${WelcomeScreen} onDone=${createUser} isAdding=${false} />
    `;
  }

  if (addingUser) {
    return html`
      <${DecoLayer} gender=${currentUser?.gender || 'boy'} />
      <${WelcomeScreen} onDone=${createUser} isAdding=${true} />
    `;
  }

  if (screen === 'challenge') {
    return html`
      <${DecoLayer} gender=${currentUser.gender} />
      <${ChallengeScreen}
        user=${currentUser}
        onComplete=${handleChallengeComplete}
        onQuit=${() => setScreen('home')}
      />
    `;
  }

  if (screen === 'results' && result) {
    return html`
      <${DecoLayer} gender=${currentUser.gender} />
      <${ResultsScreen}
        result=${result}
        user=${currentUser}
        onRetry=${() => setScreen('challenge')}
        onHome=${() => setScreen('home')}
      />
    `;
  }

  if (screen === 'leaderboard') {
    return html`
      <${DecoLayer} gender=${currentUser.gender} />
      <${LeaderboardScreen}
        users=${users}
        currentId=${currentId}
        onHome=${() => setScreen('home')}
        onStart=${() => setScreen('challenge')}
      />
    `;
  }

  // Default: Home
  return html`
    <${DecoLayer} gender=${currentUser.gender} />

    ${showSwitcher ? html`
      <${UserSwitcher}
        users=${users}
        currentId=${currentId}
        onSwitch=${(id) => { setCurrentId(id); setShowSwitcher(false); }}
        onAdd=${() => { setShowSwitcher(false); setAddingUser(true); }}
        onClose=${() => setShowSwitcher(false)}
      />
    ` : null}

    <${HomeScreen}
      user=${currentUser}
      users=${users}
      currentId=${currentId}
      onStart=${() => setScreen('challenge')}
      onLeaderboard=${() => setScreen('leaderboard')}
      onSwitchUser=${() => setShowSwitcher(true)}
    />
  `;
}

// ═══════════════════════════════════════════════════════════════════
//  MOUNT
// ═══════════════════════════════════════════════════════════════════

createRoot(document.getElementById('root')).render(html`<${App} />`);
