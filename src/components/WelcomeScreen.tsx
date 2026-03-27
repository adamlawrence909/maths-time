import { useState } from 'react';
import { Gender } from '../types';

interface Props {
  onDone: (name: string, gender: Gender) => void;
  isAdding: boolean;
}

export default function WelcomeScreen({ onDone, isAdding }: Props) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || !gender) return;
    onDone(trimmed, gender);
  }

  const isValid = !!name.trim() && !!gender;

  return (
    <div className="screen-wrap">
      <div className="card text-center">
        <span className="welcome-emoji">{isAdding ? '➕' : '👋'}</span>
        <h2>{isAdding ? 'Add a Player' : 'Welcome to MathSmash!'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
          {isAdding ? 'Create a profile for the new player' : 'Set up your profile to get started'}
        </p>

        <input
          className="name-input"
          type="text"
          placeholder="Enter your name..."
          maxLength={12}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoComplete="off"
        />

        <div className="gender-row">
          <button
            className={'gender-btn' + (gender === 'boy' ? ' selected' : '')}
            onClick={() => setGender('boy')}
          >
            <span className="gender-icon">🚀</span>
            <div className="gender-label">Explorer</div>
            <div className="gender-sub">Space theme</div>
          </button>
          <button
            className={'gender-btn' + (gender === 'girl' ? ' selected' : '')}
            onClick={() => setGender('girl')}
          >
            <span className="gender-icon">🦄</span>
            <div className="gender-label">Magic Star</div>
            <div className="gender-sub">Rainbow theme</div>
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          {isAdding ? '✅ Add Player' : "🎯 Let's Play!"}
        </button>
      </div>
    </div>
  );
}
