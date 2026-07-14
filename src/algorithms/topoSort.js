// Topological sort via Kahn's algorithm (in-degree based, not DFS).
// Edge case handled: cyclic input. A cycle has no valid ordering, so we bail
// out up front with a single error step instead of emitting a partial,
// misleading order.

import { getNeighbors } from '../graph/model.js';
import { hasCycle } from '../graph/validate.js';
import { createStep, recordSteps } from './stepRecorder.js';

export function topoSort(graph) {
  const rec = recordSteps();

  if (hasCycle(graph)) {
    rec.push(createStep({
      visited: [], frontier: [], current: null, edgesUsed: [],
      extra: { error: 'cycle detected', order: [] },
    }));
    return rec.steps;
  }

  const ids = graph.nodes.map((n) => n.id);
  const nodeSet = new Set(ids);

  const indeg = {};
  for (const id of ids) indeg[id] = 0;
  for (const edge of graph.edges) {
    if (nodeSet.has(edge.from) && nodeSet.has(edge.to)) indeg[edge.to] += 1;
  }

  const ready = ids.filter((id) => indeg[id] === 0);   // frontier: zero in-degree
  const order = [];
  const usedEdges = [];

  rec.push(createStep({
    visited: order, frontier: ready, current: null, edgesUsed: usedEdges,
    extra: { order },
  }));

  while (ready.length > 0) {
    const u = ready.shift();
    order.push(u);

    for (const { to } of getNeighbors(graph, u)) {
      if (!nodeSet.has(to)) continue;
      usedEdges.push({ from: u, to });
      indeg[to] -= 1;
      if (indeg[to] === 0) ready.push(to);
    }

    rec.push(createStep({
      visited: order, frontier: ready, current: u, edgesUsed: usedEdges,
      extra: { order },
    }));
  }

  return rec.steps;
}
