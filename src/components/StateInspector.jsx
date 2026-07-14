const DASH = '—';

function fmtNum(v) {
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  return String(v);
}

function Chips({ items, empty = DASH }) {
  if (!items || items.length === 0) return <span className="inspector__v">{empty}</span>;
  return (
    <div>
      {items.map((it, i) => (
        <span className="chip" key={`${it}-${i}`}>{it}</span>
      ))}
    </div>
  );
}

function Block({ k, children }) {
  return (
    <div className="inspector__block">
      <div className="inspector__k">{k}</div>
      {children}
    </div>
  );
}

// label: 'Queue' | 'Stack' | 'Ready set' | 'Priority queue' (frontier meaning).
export default function StateInspector({ currentStep, label = 'Frontier' }) {
  const extra = currentStep?.extra || {};
  const distanceEntries = extra.distances ? Object.entries(extra.distances) : null;

  return (
    <div className="section panel inspector">
      <p className="section__title">State</p>

      <Block k="Current">
        <span className="inspector__v">{currentStep?.current ?? DASH}</span>
      </Block>

      <Block k={label}>
        <Chips items={currentStep?.frontier} />
      </Block>

      <Block k="Visited">
        <Chips items={currentStep?.visited} />
      </Block>

      {extra.error && (
        <Block k="Note">
          <span className="error-text">{extra.error}</span>
        </Block>
      )}

      {extra.order && (
        <Block k="Order">
          <Chips items={extra.order} />
        </Block>
      )}

      {distanceEntries && (
        <Block k="Distances">
          <Chips items={distanceEntries.map(([id, d]) => `${id}: ${fmtNum(d)}`)} />
        </Block>
      )}
    </div>
  );
}
