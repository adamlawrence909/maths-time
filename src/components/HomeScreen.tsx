import { User } from '../types';
import { THEMES, fmt, today } from '../utils';

interface Props {
  user: User;
  onStart: () => void;
  onLeaderboard: () => void;
  onSwitchUser: () => void;
}

export default function HomeScreen({ user, onStart, onLeaderboard, onSwitchUser }: Props) {
  const theme = THEMES[user.gender] || THEMES.boy;

  const streakMsg = (() => {
    if (user.lastPlayed === today() && user.plays > 0)
      return `🔥 You've already played today! Beat ${fmt(user.bestTime)}?`;
    if (user.streak > 1) return `🔥 ${user.streak}-day streak! Don't break it!`;
    if (user.plays === 0) return 'Complete your first challenge today!';
    return 'Play today to keep your streak going!';
  })();

  return (
    <div className="screen-wrap">
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div className="app-title">MathSmash</div>
            <div className="app-sub">Friends of 10</div>
          </div>
          <button className="btn-icon" onClick={onSwitchUser} title="Switch player">
            {theme.avatar}
          </button>
        </div>

        {/* Greeting */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Hey {user.name}! {theme.greeting}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">⏱️ BEST</div>
            <div className="stat-value">{user.bestTime ? fmt(user.bestTime) : '–:––'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">🔥 STREAK</div>
            <div className="stat-value">{user.streak}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">✅ PLAYS</div>
            <div className="stat-value">{user.plays}</div>
          </div>
        </div>

        <div className="streak-msg">{streakMsg}</div>

        <button className="btn btn-primary" onClick={onStart}>
          ⚡ Start Challenge!
        </button>

        {/* How to play */}
        <div className="how-to">
          <div className="how-to-title">🎓 How to Play</div>
          <p>
            Two numbers that add up to{' '}
            <strong style={{ color: 'var(--primary-light)' }}>10</strong> are{' '}
            <strong style={{ color: 'var(--primary-light)' }}>Friends of 10!</strong>
          </p>
          <span className="eq-example">
            7 + <span>__</span> = 10 → <span>3</span>
          </span>
          <p>Solve 20 questions as fast as you can! Use the number pad, keyboard, or your voice 🎤</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-bar">
        <button className="nav-btn active">🏠 Home</button>
        <button className="nav-btn" onClick={onLeaderboard}>🏆 Leaderboard</button>
      </div>
    </div>
  );
}
