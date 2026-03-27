import { useEffect } from 'react';
import { User, Result } from '../types';
import { fmtRaw, fmt, starsFor, msgFor, launchConfetti } from '../utils';

interface Props {
  result: Result;
  user: User;
  onRetry: () => void;
  onHome: () => void;
}

export default function ResultsScreen({ result, user, onRetry, onHome }: Props) {
  const { seconds, isNew, streak } = result;

  useEffect(() => { launchConfetti(); }, []);

  return (
    <div className="screen-wrap">
      <div className="card text-center">
        <div className="result-emoji">🎉</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Challenge Complete!
        </div>
        <div className="result-time">{fmtRaw(seconds)}</div>
        <div className="stars">{starsFor(seconds)}</div>

        {isNew && result.prevBest > 0
          ? <div className="new-best-badge">🏆 New Best Time!</div>
          : null
        }

        <div className="result-msg">{msgFor(seconds)}</div>

        <div className="result-grid">
          <div className="result-box">
            <div className="result-box-label">🏅 Best</div>
            <div className="result-box-value">{fmt(user.bestTime)}</div>
          </div>
          <div className="result-box">
            <div className="result-box-label">🔥 Streak</div>
            <div className="result-box-value">{streak}</div>
          </div>
          <div className="result-box">
            <div className="result-box-label">✅ Plays</div>
            <div className="result-box-value">{user.plays}</div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onRetry}>🔄 Try Again!</button>
        <button className="btn btn-ghost" style={{ width: '100%', marginTop: '6px' }} onClick={onHome}>
          🏠 Home
        </button>
      </div>
    </div>
  );
}
