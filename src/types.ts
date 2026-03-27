export interface User {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  bestTime: number;
  streak: number;
  lastPlayed: string;
  plays: number;
}

export interface Problem {
  given: number;
  answer: number;
  blankLeft: boolean;
}

export interface Result {
  seconds: number;
  isNew: boolean;
  prevBest: number;
  streak: number;
}

export interface ThemeConfig {
  decos: string[];
  avatar: string;
  greeting: string;
  name: string;
}

export type Gender = 'boy' | 'girl';
export type Screen = 'welcome' | 'home' | 'challenge' | 'results' | 'leaderboard';
