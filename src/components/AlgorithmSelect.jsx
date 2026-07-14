import { ALGORITHMS } from '../algorithms/registry.js';

// Directed-only algorithms are disabled (with an inline note) on undirected graphs.
export default function AlgorithmSelect({ value, onChange, graphIsDirected }) {
  const hasDisabled = ALGORITHMS.some((a) => a.needsDirected) && !graphIsDirected;

  return (
    <div className="field">
      <label className="label" htmlFor="algo-select">Algorithm</label>
      <select
        id="algo-select"
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {ALGORITHMS.map((a) => {
          const disabled = a.needsDirected && !graphIsDirected;
          return (
            <option
              key={a.value}
              value={a.value}
              disabled={disabled}
              title={disabled ? 'requires directed graph' : undefined}
            >
              {a.label}{disabled ? ' — requires directed graph' : ''}
            </option>
          );
        })}
      </select>
      {hasDisabled && (
        <span className="label">Dijkstra, Topological Sort &amp; Longest Path require a directed graph.</span>
      )}
    </div>
  );
}
