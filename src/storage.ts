import { User } from './types';

export function loadUsers(): User[] {
  try { return JSON.parse(localStorage.getItem('ms_users') || '[]'); } catch { return []; }
}

export function saveUsers(u: User[]): void {
  localStorage.setItem('ms_users', JSON.stringify(u));
}

export function loadCurrent(): string | null {
  return localStorage.getItem('ms_current') || null;
}

export function saveCurrent(id: string): void {
  localStorage.setItem('ms_current', id);
}
