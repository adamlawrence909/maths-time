import { User } from '../types';
import { THEMES, fmt } from '../utils';

interface Props {
  users: User[];
  currentId: string | null;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export default function UserSwitcher({ users, currentId, onSwitch, onAdd, onClose }: Props) {
  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-title">👥 Switch Player</div>
        <div className="user-list">
          {users.map(u => (
            <button
              key={u.id}
              className={'user-row' + (u.id === currentId ? ' active' : '')}
              onClick={() => onSwitch(u.id)}
            >
              <span className="user-row-avatar">{THEMES[u.gender]?.avatar || '🧒'}</span>
              <span className="user-row-name">{u.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                {u.bestTime ? fmt(u.bestTime) : 'No plays yet'}
              </span>
              {u.id === currentId ? <span className="user-row-check">✓</span> : null}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onAdd}>
          ➕ Add New Player
        </button>
        <button className="btn btn-ghost" style={{ width: '100%', marginTop: '8px' }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
