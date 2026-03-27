import { useState, useEffect } from 'react';
import { User, Result, Screen } from './types';
import { uid, today } from './utils';
import { loadUsers, saveUsers, loadCurrent, saveCurrent } from './storage';
import DecoLayer from './components/DecoLayer';
import WelcomeScreen from './components/WelcomeScreen';
import UserSwitcher from './components/UserSwitcher';
import HomeScreen from './components/HomeScreen';
import ChallengeScreen from './components/ChallengeScreen';
import ResultsScreen from './components/ResultsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

export default function App() {
  const [users,      setUsers]      = useState<User[]>(() => loadUsers());
  const [currentId,  setCurrentId]  = useState<string | null>(() => loadCurrent());
  const [screen,     setScreen]     = useState<Screen>('home');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [addingUser,   setAddingUser]   = useState(false);
  const [result,     setResult]     = useState<Result | null>(null);

  const currentUser = users.find(u => u.id === currentId) ?? null;

  // Persist state
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mutUser(id: string, updates: Partial<User>) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }

  function createUser(name: string, gender: 'boy' | 'girl') {
    const u: User = { id: uid(), name, gender, bestTime: 0, streak: 0, lastPlayed: '', plays: 0 };
    setUsers(prev => [...prev, u]);
    setCurrentId(u.id);
    setAddingUser(false);
    setShowSwitcher(false);
    setScreen('home');
  }

  function handleChallengeComplete(sec: number) {
    if (!currentUser || !currentId) return;
    const prev  = currentUser.bestTime;
    const isNew = prev === 0 || sec < prev;
    const yest  = new Date(Date.now() - 86_400_000).toDateString();
    let streak  = currentUser.streak;
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

  // ── Screens ──────────────────────────────────────────────────────

  if (screen === 'welcome' || (!currentUser && !addingUser)) {
    return (
      <>
        <DecoLayer gender="boy" />
        <WelcomeScreen onDone={createUser} isAdding={false} />
      </>
    );
  }

  if (addingUser) {
    return (
      <>
        <DecoLayer gender={currentUser?.gender || 'boy'} />
        <WelcomeScreen onDone={createUser} isAdding={true} />
      </>
    );
  }

  if (screen === 'challenge' && currentUser) {
    return (
      <>
        <DecoLayer gender={currentUser.gender} />
        <ChallengeScreen
          user={currentUser}
          onComplete={handleChallengeComplete}
          onQuit={() => setScreen('home')}
        />
      </>
    );
  }

  if (screen === 'results' && result && currentUser) {
    return (
      <>
        <DecoLayer gender={currentUser.gender} />
        <ResultsScreen
          result={result}
          user={currentUser}
          onRetry={() => setScreen('challenge')}
          onHome={() => setScreen('home')}
        />
      </>
    );
  }

  if (screen === 'leaderboard' && currentUser) {
    return (
      <>
        <DecoLayer gender={currentUser.gender} />
        <LeaderboardScreen
          users={users}
          currentId={currentId}
          onHome={() => setScreen('home')}
          onStart={() => setScreen('challenge')}
        />
      </>
    );
  }

  // Default: Home
  return (
    <>
      <DecoLayer gender={currentUser!.gender} />
      {showSwitcher && (
        <UserSwitcher
          users={users}
          currentId={currentId}
          onSwitch={id => { setCurrentId(id); setShowSwitcher(false); }}
          onAdd={() => { setShowSwitcher(false); setAddingUser(true); }}
          onClose={() => setShowSwitcher(false)}
        />
      )}
      <HomeScreen
        user={currentUser!}
        onStart={() => setScreen('challenge')}
        onLeaderboard={() => setScreen('leaderboard')}
        onSwitchUser={() => setShowSwitcher(true)}
      />
    </>
  );
}
