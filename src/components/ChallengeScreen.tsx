import { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { makeProblems, pick, fmtRaw, TOTAL_Q, CORRECT_MSGS, INCORRECT_MSGS, WORD_NUMS } from '../utils';
import NumberPad from './NumberPad';

interface Props {
  user: User;
  onComplete: (seconds: number) => void;
  onQuit: () => void;
}

export default function ChallengeScreen({ onComplete, onQuit }: Props) {
  const [questions]             = useState(() => makeProblems());
  const [qIndex, setQIndex]     = useState(0);
  const [input, setInput]       = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [micOn, setMicOn]       = useState(false);
  const [micHint, setMicHint]   = useState('Tap to speak');
  const [seconds, setSeconds]   = useState(0);
  const [locked, setLocked]     = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);
  const waitRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<string>('');
  const audioCtx = useRef<AudioContext | null>(null);

  function getAudioCtx() {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    return audioCtx.current;
  }

  function playCorrect() {
    const ctx = getAudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.25);
    });
  }

  function playWrong() {
    const ctx = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  // Keep ref in sync for keyboard handler closure
  useEffect(() => { inputRef.current = input; }, [input]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Keyboard handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked) return;
      const cur = inputRef.current;

      if (e.key === 'Backspace') { e.preventDefault(); clearWait(); setInput(''); return; }
      if (e.key === 'Enter')     { e.preventDefault(); submitAnswer(cur); return; }

      const d = parseInt(e.key);
      if (isNaN(d)) return;
      e.preventDefault();

      if (waitRef.current && d === 0) {
        // "1" followed by "0" → "10"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, qIndex]);

  function clearWait() {
    if (waitRef.current) { clearTimeout(waitRef.current); waitRef.current = null; }
  }

  function submitAnswer(val?: string) {
    if (locked) return;
    const v = val !== undefined ? val : input;
    if (v === '') return;

    const q = questions[qIndex];
    const given = parseInt(v);

    if (given === q.answer) {
      playCorrect();
      setFeedback({ text: pick(CORRECT_MSGS), type: 'correct' });
      setLocked(true);
      const next = qIndex + 1;
      if (next >= TOTAL_Q) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (recogRef.current) try { recogRef.current.stop(); } catch { /* ignore */ }
        setTimeout(() => onComplete(seconds + 1), 500);
      } else {
        setTimeout(() => {
          setFeedback({ text: '', type: '' });
          setInput('');
          setQIndex(next);
          setLocked(false);
        }, 500);
      }
    } else {
      playWrong();
      setFeedback({ text: pick(INCORRECT_MSGS), type: 'incorrect' });
      setTimeout(() => {
        setFeedback({ text: '', type: '' });
        setInput('');
      }, 600);
    }
  }

  function pressNum(n: number) {
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

  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (micOn) {
      try { recogRef.current?.stop(); } catch { /* ignore */ }
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
    r.onresult = (ev: SpeechRecognitionEvent) => {
      for (let a = 0; a < ev.results[0].length; a++) {
        const text = ev.results[0][a].transcript.trim().toLowerCase();
        const m = text.match(/\b(10|[0-9])\b/);
        if (m) {
          const n = parseInt(m[1]);
          setInput(String(n));
          setTimeout(() => submitAnswer(String(n)), 250);
          return;
        }
        for (const [w, num] of Object.entries(WORD_NUMS)) {
          if (text.includes(w)) {
            setInput(String(num));
            setTimeout(() => submitAnswer(String(num)), 250);
            return;
          }
        }
      }
      setMicHint("Didn't catch that!");
    };
    recogRef.current = r;
    try { r.start(); } catch { /* ignore */ }
  }

  const q = questions[qIndex];
  const pct = ((qIndex / TOTAL_Q) * 100).toFixed(1);
  const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const blankEl = (
    <span className={'blank' + (input ? ' has-value' : '')}>{input || ''}</span>
  );

  const eq = q.blankLeft
    ? (
      <div className="equation">
        {blankEl}
        <span className="eq-op">+</span>
        <span>{q.given}</span>
        <span className="eq-eq">=</span>
        <span className="eq-ten">10</span>
      </div>
    )
    : (
      <div className="equation">
        <span>{q.given}</span>
        <span className="eq-op">+</span>
        {blankEl}
        <span className="eq-eq">=</span>
        <span className="eq-ten">10</span>
      </div>
    );

  function handleQuit() {
    if (confirm("Quit? Your time won't be saved.")) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recogRef.current) try { recogRef.current.stop(); } catch { /* ignore */ }
      onQuit();
    }
  }

  return (
    <div className="screen-wrap">
      <div className="card">
        {/* Header */}
        <div className="challenge-header">
          <button className="btn-icon" onClick={handleQuit}>←</button>
          <div className="timer-display">{fmtRaw(seconds)}</div>
          <div style={{ width: '44px' }} />
        </div>

        {/* Progress */}
        <div className="progress-row">
          <span className="progress-label">Q{qIndex + 1}/{TOTAL_Q}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Equation */}
        <div className="equation-wrap">{eq}</div>

        {/* Feedback */}
        <div className={'feedback ' + feedback.type}>{feedback.text}</div>

        {/* Mic */}
        {hasSR && (
          <div className="mic-row">
            <button className={'mic-btn' + (micOn ? ' on' : '')} onClick={toggleMic}>🎤</button>
            <span className="mic-hint">{micHint}</span>
          </div>
        )}

        {/* Number pad */}
        <NumberPad onKey={pressNum} onDelete={pressDelete} />
      </div>
    </div>
  );
}
