import Node from './Node.jsx';
import Edge, { ARROW_MARKER_ID } from './Edge.jsx';

const NODE_RADIUS = 24;

function nodeState(id, currentStep) {
  if (!currentStep) return 'idle';
  if (currentStep.current === id) return 'current';
  if (currentStep.frontier?.includes(id)) return 'frontier';
  if (currentStep.visited?.includes(id)) return 'visited';
  return 'idle';
}

function isTraversed(edge, currentStep, directed) {
  const used = currentStep?.edgesUsed;
  if (!used || used.length === 0) return false;
  return used.some((e) =>
    (e.from === edge.from && e.to === edge.to) ||
    (!directed && e.from === edge.to && e.to === edge.from)
  );
}

// Pull the arrow endpoint back to the node's edge so the arrowhead is visible
// instead of buried under the target circle.
function trimToBoundary(fromX, fromY, toX, toY, r) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: toX, y: toY };
  return { x: toX - (dx / len) * r, y: toY - (dy / len) * r };
}

function EmptyState() {
  return (
    <div className="canvas-empty">
      <svg className="canvas-empty__mark" width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
        <line x1="20" y1="52" x2="60" y2="20" stroke="var(--edge-idle)" strokeWidth="2" />
        <line x1="60" y1="20" x2="100" y2="52" stroke="var(--edge-idle)" strokeWidth="2" />
        <circle cx="20" cy="52" r="9" fill="none" stroke="var(--node-idle-stroke)" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="60" cy="20" r="9" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="100" cy="52" r="9" fill="none" stroke="var(--node-idle-stroke)" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
      <p className="canvas-empty__title">No graph loaded</p>
      <p className="canvas-empty__hint">Paste a graph or pick a preset to begin</p>
    </div>
  );
}

export default function GraphCanvas({ graph, layout, currentStep }) {
  if (!graph || !layout || graph.nodes.length === 0) return <EmptyState />;
  const directed = !!graph.directed;

  return (
    <svg viewBox="0 0 1000 1000" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker
          id={ARROW_MARKER_ID}
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={7}
          markerHeight={7}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge-idle)" />
        </marker>

        {/* genuine glow for the 'current' node — SVG drop-shadow, not box-shadow */}
        <filter id="node-glow" x="-75%" y="-75%" width="250%" height="250%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="7"
            style={{ floodColor: 'var(--accent)', floodOpacity: 0.85 }}
          />
        </filter>
      </defs>

      {/* edges first so nodes render on top */}
      {graph.edges.map((edge, i) => {
        const from = layout.get(edge.from);
        const to = layout.get(edge.to);
        if (!from || !to) return null;
        const end = trimToBoundary(from.x, from.y, to.x, to.y, NODE_RADIUS);
        return (
          <Edge
            key={`e${i}-${edge.from}-${edge.to}`}
            fromX={from.x}
            fromY={from.y}
            toX={end.x}
            toY={end.y}
            traversed={isTraversed(edge, currentStep, directed)}
            directed={directed}
          />
        );
      })}

      {graph.nodes.map((node, i) => {
        const pos = layout.get(node.id);
        if (!pos) return null;
        return (
          <Node
            key={node.id}
            id={node.id}
            label={node.label}
            x={pos.x}
            y={pos.y}
            index={i}
            state={nodeState(node.id, currentStep)}
          />
        );
      })}
    </svg>
  );
}
