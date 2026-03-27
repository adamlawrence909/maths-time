import { THEMES } from '../utils';

interface Props {
  gender: string;
}

export default function DecoLayer({ gender }: Props) {
  const decos = THEMES[gender]?.decos || THEMES.boy.decos;
  const items = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    emoji: decos[i % decos.length],
    left: (i * 6.5) % 100,
    duration: 14 + (i * 3.1) % 12,
    delay: (i * 2.3) % 10,
    size: 1.1 + (i % 4) * 0.25,
  }));

  return (
    <div className="deco-layer">
      {items.map(d => (
        <div
          key={d.id}
          className="deco"
          style={{
            left: `${d.left}vw`,
            fontSize: `${d.size}rem`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        >
          {d.emoji}
        </div>
      ))}
    </div>
  );
}
