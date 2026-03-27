import { User } from '../types';
import { THEMES, fmt } from '../utils';

interface Props {
  users: User[];
  currentId: string | null;
  onHome: () => void;
  onStart: () => void;
}

export default function LeaderboardScreen({ users, currentId, onHome, onStart }: Props) {
  const played   = users.filter(u => u.bestTime > 0).sort((a, b) => a.bestTime - b.bestTime);
  const unplayed = users.filter(u => !u.bestTime);
  const sorted   = [...played, ...unplayed];

  const medals = ['🥇', '🥈', '🥉'];

  const podiumUsers = played.slice(0, 3);
  // Reorder for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [podiumUsers[1], podiumUsers[0], podiumUsers[2]].filter((u): u is User => Boolean(u));
  const podiumClass = podiumUsers[1] ? ['podium-2', 'podium-1', 'podium-3'] : ['podium-1'];

  return (
    <div className="screen-wrap">
      <div className="card">
        {/* Header */}
        <div className="lb-header">
          <button className="btn-icon" onClick={onHome}>←</button>
          <h2>🏆 Leaderboard</h2>
          <div style={{ width: '44px' }} />
        </div>

        {/* Podium */}
        {played.length > 0 ? (
          <div className="podium">
            {podiumOrder.map((u, i) => (
              <div key={u.id} className={'podium-slot ' + podiumClass[i]}>
                <div className="podium-avatar">{THEMES[u.gender]?.avatar || '🧒'}</div>
                <div className="podium-medal">{medals[podiumOrder.indexOf(u)]}</div>
                <div className="podium-name">{u.name}</div>
                <div className="podium-time">{fmt(u.bestTime)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontWeight: 700 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
            No times yet! Be the first to set a score!
          </div>
        )}

        {/* Full list */}
        <div className="lb-list">
          {sorted.map((u, i) => {
            const rank = u.bestTime > 0 ? i + 1 : null;
            const isCurrent = u.id === currentId;
            return (
              <div key={u.id} className={'lb-row' + (isCurrent ? ' current-user' : '')}>
                <div className="lb-rank">{rank ? (medals[rank - 1] || `#${rank}`) : '–'}</div>
                <div className="lb-avatar">{THEMES[u.gender]?.avatar || '🧒'}</div>
                <div className="lb-info">
                  <div className="lb-name">{u.name} {isCurrent ? '(you)' : ''}</div>
                  <div className="lb-meta">🔥 {u.streak} streak · ✅ {u.plays} plays</div>
                </div>
                <div className="lb-time">{u.bestTime ? fmt(u.bestTime) : '–:––'}</div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onStart}>
          ⚡ Play Now!
        </button>
      </div>

      <div className="nav-bar">
        <button className="nav-btn" onClick={onHome}>🏠 Home</button>
        <button className="nav-btn active">🏆 Leaderboard</button>
      </div>
    </div>
  );
}
