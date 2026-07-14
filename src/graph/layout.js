import { hasCycle } from './validate.js';

// Deterministic node positioning in a 0–1000 x 0–1000 space.
export function computeLayout(graph, { type = 'auto' } = {}) {
  let mode = type;

  if (mode === 'auto') {
    mode = graph.directed && !hasCycle(graph) ? 'layered' : 'circular';
  }

  if (mode === 'layered') {
    // cycle guard: longest-path layering is undefined on cyclic graphs
    if (hasCycle(graph)) return circularLayout(graph);
    return layeredLayout(graph);
  }

  return circularLayout(graph);
}

function circularLayout(graph) {
  const positions = new Map();
  const n = graph.nodes.length;
  const cx = 500, cy = 500, radius = 400;

  graph.nodes.forEach((node, i) => {
    // start at top (-90deg) for a stable, readable orientation
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / (n || 1);
    positions.set(node.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  return positions;
}

function layeredLayout(graph) {
  const positions = new Map();
  const ids = graph.nodes.map((node) => node.id);

  // predecessors per node, from directed edges
  const preds = new Map(ids.map((id) => [id, []]));
  for (const edge of graph.edges) {
    if (preds.has(edge.to)) preds.get(edge.to).push(edge.from);
  }

  // longest-path-from-root layering: layer[v] = max(layer[u] + 1) over u->v
  // roots (no predecessors) land on layer 0. Memoized; graph is acyclic here.
  const memo = new Map();
  function longestFromRoot(id) {
    if (memo.has(id)) return memo.get(id);
    let best = 0;
    for (const p of preds.get(id) || []) {
      best = Math.max(best, longestFromRoot(p) + 1);
    }
    memo.set(id, best);
    return best;
  }

  const layer = new Map(ids.map((id) => [id, longestFromRoot(id)]));

  // bucket nodes by layer, preserving graph.nodes order for determinism
  const buckets = new Map();
  for (const id of ids) {
    const l = layer.get(id);
    if (!buckets.has(l)) buckets.set(l, []);
    buckets.get(l).push(id);
  }

  const layerGap = 150;
  const width = 1000;

  for (const [l, members] of buckets) {
    const count = members.length;
    members.forEach((id, i) => {
      // evenly space across width; single node centers at 500
      const x = count === 1 ? width / 2 : (width * (i + 1)) / (count + 1);
      const y = 100 + l * layerGap;
      positions.set(id, { x, y });
    });
  }

  return positions;
}
