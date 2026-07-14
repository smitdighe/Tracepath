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

// Layout stays inside a 100px margin of the 0–1000 space so nodes (r=24)
// never clip against the viewBox edge.
const MARGIN = 100;
const SPAN = 1000 - 2 * MARGIN; // 800

function layeredLayout(graph) {
  const positions = new Map();
  const ids = graph.nodes.map((node) => node.id);
  if (ids.length === 0) return positions;

  // predecessors + successors from directed edges (edge order preserved)
  const preds = new Map(ids.map((id) => [id, []]));
  const succ = new Map(ids.map((id) => [id, []]));
  for (const edge of graph.edges) {
    if (preds.has(edge.to)) preds.get(edge.to).push(edge.from);
    if (succ.has(edge.from)) succ.get(edge.from).push(edge.to);
  }

  // Vertical (layer): longest-path layering — layer[v] = max(layer[u] + 1)
  // over ALL predecessors u->v (a node with parents at different depths sits
  // below the deepest one). Roots (no predecessors) land on layer 0.
  const memo = new Map();
  const inFlight = new Set();
  function longestFromRoot(id) {
    if (memo.has(id)) return memo.get(id);
    if (inFlight.has(id)) return 0; // defensive; graph is acyclic here
    inFlight.add(id);
    let best = 0;
    for (const p of preds.get(id) || []) {
      best = Math.max(best, longestFromRoot(p) + 1);
    }
    inFlight.delete(id);
    memo.set(id, best);
    return best;
  }
  const layer = new Map(ids.map((id) => [id, longestFromRoot(id)]));
  const maxLayer = Math.max(0, ...ids.map((id) => layer.get(id)));

  // Horizontal (order): a global left-to-right DFS ordering. Each node gets a
  // distinct column, so the drawing always uses the canvas width instead of
  // collapsing single-node layers onto the centre line. Subtrees stay
  // contiguous, which keeps edge crossings low. Roots are seeded in node
  // order, then any remaining nodes (disconnected components) follow.
  const roots = ids.filter((id) => (preds.get(id) || []).length === 0);
  const seen = new Set();
  const order = new Map();
  let counter = 0;
  for (const seed of [...roots, ...ids]) {
    if (seen.has(seed)) continue;
    const stack = [seed];
    while (stack.length > 0) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      order.set(id, counter++);
      const kids = succ.get(id) || [];
      for (let i = kids.length - 1; i >= 0; i--) {
        if (!seen.has(kids[i])) stack.push(kids[i]);
      }
    }
  }

  // Map order -> x and layer -> y, both scaled to fit [MARGIN, 1000-MARGIN].
  const lastOrder = ids.length - 1;
  const xOf = (o) => (lastOrder === 0 ? 500 : MARGIN + (o * SPAN) / lastOrder);
  const yOf = (l) => (maxLayer === 0 ? 500 : MARGIN + (l * SPAN) / maxLayer);

  for (const id of ids) {
    positions.set(id, { x: xOf(order.get(id)), y: yOf(layer.get(id)) });
  }

  return positions;
}
