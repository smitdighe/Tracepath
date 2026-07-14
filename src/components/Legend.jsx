import { getNodeColor, getEdgeColor } from '../utils/colors.js';

// Colors come straight from colors.js (same source the canvas uses) — no
// duplicated literals. idle renders as a hollow ring to match the canvas.
const NODE_ITEMS = [
  { state: 'idle', label: 'Unvisited' },
  { state: 'frontier', label: 'Frontier' },
  { state: 'current', label: 'Current' },
  { state: 'visited', label: 'Visited' },
];

function swatchStyle(state) {
  const color = getNodeColor(state);
  if (state === 'idle') {
    return { background: 'transparent', border: `2px solid ${color}` };
  }
  return { background: color };
}

export default function Legend() {
  return (
    <div className="legend panel" role="list" aria-label="Legend">
      <p className="legend__title">States</p>
      {NODE_ITEMS.map(({ state, label }) => (
        <div className="legend__row" role="listitem" key={state}>
          <span className="legend__swatch" style={swatchStyle(state)} />
          <span>{label}</span>
        </div>
      ))}
      <div className="legend__row" role="listitem">
        <span className="legend__edge" style={{ borderTopColor: getEdgeColor(true) }} />
        <span>Path taken</span>
      </div>
    </div>
  );
}
