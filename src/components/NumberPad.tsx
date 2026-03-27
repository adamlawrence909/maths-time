interface Props {
  onKey: (n: number) => void;
  onDelete: () => void;
}

export default function NumberPad({ onKey, onDelete }: Props) {
  return (
    <div className="numpad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button key={n} className="nk" onClick={() => onKey(n)}>
          {n}
        </button>
      ))}
      <button className="nk nk-ten" onClick={() => onKey(10)}>10</button>
      <button className="nk nk-zero" onClick={() => onKey(0)}>0</button>
      <button className="nk nk-del" onClick={onDelete}>⌫</button>
    </div>
  );
}
