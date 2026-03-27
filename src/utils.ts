import { ThemeConfig, Problem } from './types';

export const TOTAL_Q = 20;

export const THEMES: Record<string, ThemeConfig> = {
  boy:  { decos: ['🚀','🌙','⭐','🪐','🛸','💫','🌟','🔭'], avatar: '🧒', greeting: 'Ready to blast off?', name: 'Space Explorer' },
  girl: { decos: ['🦄','✨','🌸','🎀','⭐','💜','🌈','🦋'], avatar: '👧', greeting: 'Ready to shine?',     name: 'Magic Star' },
};

export const CORRECT_MSGS   = ['⭐ Yes!', '🎉 Correct!', '💪 Right!', '🌟 Brilliant!', '🎯 Perfect!', '✅ Spot on!', '🚀 Amazing!'];
export const INCORRECT_MSGS = ['Not quite… 🤔', 'Try again! 🔄', 'Have another go! 💭'];

export const WORD_NUMS: Record<string, number> = {
  zero:0, nought:0, oh:0, one:1, won:1, two:2, to:2, too:2,
  three:3, free:3, four:4, for:4, fore:4, five:5, six:6,
  seven:7, eight:8, ate:8, nine:9, nein:9, ten:10, tin:10,
};

export function uid()    { return Math.random().toString(36).slice(2, 10); }
export function today()  { return new Date().toDateString(); }
export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function fmt(sec: number | null | undefined): string {
  if (!sec || sec === 0) return '–:––';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtRaw(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeProblems(): Problem[] {
  const base: Problem[] = [];
  for (let i = 0; i <= 10; i++)
    base.push({ given: i, answer: 10 - i, blankLeft: Math.random() < 0.5 });
  shuffle(base);
  const extras: Problem[] = Array.from({ length: TOTAL_Q - base.length }, () => {
    const g = Math.floor(Math.random() * 11);
    return { given: g, answer: 10 - g, blankLeft: Math.random() < 0.5 };
  });
  return shuffle([...base, ...extras]);
}

export function starsFor(sec: number): string {
  if (sec < 60)  return '⭐⭐⭐';
  if (sec < 100) return '⭐⭐⭐';
  if (sec < 150) return '⭐⭐';
  if (sec < 240) return '⭐';
  return '🌟';
}

export function msgFor(sec: number): string {
  if (sec < 60)  return "Unbelievable speed! You're a Maths Superstar! 🚀";
  if (sec < 100) return "Amazing work! Keep smashing those times!";
  if (sec < 150) return "Great job! You're getting faster every day!";
  if (sec < 240) return "Well done! Practice makes perfect!";
  return "Fantastic effort! Keep going — you've got this! 🌈";
}

export function launchConfetti(): void {
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
