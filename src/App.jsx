import { useMemo, useState } from 'react';
import './App.css';

import GraphInput from './components/GraphInput.jsx';
import AlgorithmSelect from './components/AlgorithmSelect.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import Legend from './components/Legend.jsx';
import PlaybackBar from './components/PlaybackBar.jsx';
import StateInspector from './components/StateInspector.jsx';

import { computeLayout } from './graph/layout.js';
import { getAlgorithm } from './algorithms/registry.js';
import { usePlayback } from './playback/usePlayback.js';

export default function App() {
  const [graph, setGraph] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [startNodeId, setStartNodeId] = useState(null);

  const algo = getAlgorithm(selectedAlgorithm);
  const directed = !!graph?.directed;
  const runnable = !!graph && graph.nodes.length > 0 && !(algo.needsDirected && !directed);

  // Reset start node to the first node whenever a new graph is loaded
  // (React's adjust-state-during-render pattern — no effect, no lint warning).
  const [prevGraph, setPrevGraph] = useState(graph);
  if (graph !== prevGraph) {
    setPrevGraph(graph);
    setStartNodeId(graph?.nodes?.[0]?.id ?? null);
  }

  const layout = useMemo(
    () => (graph ? computeLayout(graph, { type: 'auto' }) : null),
    [graph]
  );

  const steps = useMemo(() => {
    if (!runnable) return [];
    try {
      return algo.usesStart ? algo.fn(graph, startNodeId) : algo.fn(graph);
    } catch {
      return [];
    }
  }, [runnable, algo, graph, startNodeId]);

  const playback = usePlayback(steps);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Tracepath</h1>
        <p className="app__tagline">Watch how graphs get solved, one step at a time.</p>
      </header>

      <div className="app__body">
        <aside className="sidebar">
          <GraphInput onGraphParsed={setGraph} />

          <div className="section panel">
            <p className="section__title">Run</p>
            <AlgorithmSelect
              value={selectedAlgorithm}
              onChange={setSelectedAlgorithm}
              graphIsDirected={directed}
            />
            {algo.usesStart && graph && graph.nodes.length > 0 && (
              <div className="field" style={{ marginTop: 'var(--sp-4)' }}>
                <label className="label" htmlFor="start-node">Start node</label>
                <select
                  id="start-node"
                  className="select"
                  value={startNodeId ?? ''}
                  onChange={(e) => setStartNodeId(e.target.value)}
                >
                  {graph.nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label ?? n.id}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        <main className="main">
          <div className="canvas-wrap">
            <GraphCanvas graph={graph} layout={layout} currentStep={playback.currentStep} />
            {runnable && <Legend />}
          </div>
          <PlaybackBar {...playback} totalSteps={steps.length} />
        </main>

        <StateInspector currentStep={playback.currentStep} label={algo.frontierLabel} />
      </div>
    </div>
  );
}
