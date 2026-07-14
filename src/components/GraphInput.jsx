import { useState } from 'react';
import { parseGraphInput } from '../graph/parser.js';
import { validateGraph } from '../graph/validate.js';

const PRESETS = [
  { label: 'Grid', name: 'grid' },
  { label: 'Tree', name: 'tree' },
  { label: 'DAG', name: 'dag' },
  { label: 'Disconnected', name: 'disconnected' },
];

const PLACEHOLDER = `Paste JSON  { "nodes": [...], "edges": [...] }
or an adjacency list:
A: B, C(2), D
B: C
C: D`;

// Runs the parser + validator on a graph object and reports the outcome.
function acceptGraph(graph, error, onGraphParsed, setError) {
  if (error) { setError(error); return; }
  const result = validateGraph(graph);
  if (!result.valid) {
    setError(result.errors.join('\n'));
    return;
  }
  setError(null);
  onGraphParsed(graph);
}

export default function GraphInput({ onGraphParsed }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  function handleLoad() {
    const { graph, error: parseError } = parseGraphInput(text);
    acceptGraph(graph, parseError, onGraphParsed, setError);
  }

  async function loadPreset(name) {
    setError(null);
    try {
      const res = await fetch(`/presets/${name}.json`);
      if (!res.ok) throw new Error(`Preset "${name}" not found (${res.status})`);
      const raw = await res.text();
      const { graph, error: parseError } = parseGraphInput(raw);
      acceptGraph(graph, parseError, onGraphParsed, setError);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="section panel">
      <p className="section__title">Graph</p>

      <div className="field">
        <textarea
          className="textarea"
          spellCheck={false}
          placeholder={PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="btn-row">
          <button className="btn btn--accent" onClick={handleLoad} disabled={text.trim() === ''}>
            Load
          </button>
        </div>
      </div>

      <div className="field" style={{ marginTop: 'var(--sp-4)' }}>
        <span className="label">Presets</span>
        <div className="btn-row">
          {PRESETS.map((p) => (
            <button key={p.name} className="btn" onClick={() => loadPreset(p.name)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-text" style={{ marginTop: 'var(--sp-3)' }}>{error}</p>}
    </div>
  );
}
