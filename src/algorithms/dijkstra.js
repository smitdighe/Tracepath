// Dijkstra with array-based min extraction (no heap needed at this size).
// Edge case handled: disconnected / unreachable nodes. They never enter the
// frontier, stay at Infinity in the distance map, and the loop simply ends
// when the frontier empties — no error, no infinite loop.

import { getNeighbors } from '../graph/model.js';
import { createStep, recordSteps } from './stepRecorder.js';

export function dijkstra(graph, startId) {
  const rec = recordSteps();
  const ids = graph.nodes.map((n) => n.id);
  const nodeSet = new Set(ids);

  const dist = {};
  const pred = {};
  for (const id of ids) { dist[id] = Infinity; pred[id] = null; }
  if (startId != null && nodeSet.has(startId)) dist[startId] = 0;

  const finalized = new Set();
  const inFrontier = new Set();
  if (nodeSet.has(startId)) inFrontier.add(startId);

  const usedEdges = [];   // shortest-path tree
  const visited = [];

  rec.push(createStep({
    visited, frontier: [...inFrontier], current: null, edgesUsed: usedEdges,
    extra: { distances: { ...dist } },
  }));

  while (inFrontier.size > 0) {
    // linear min scan; tie-break by graph node order for determinism
    let u = null;
    let best = Infinity;
    for (const id of ids) {
      if (inFrontier.has(id) && dist[id] < best) { best = dist[id]; u = id; }
    }
    if (u === null) break;   // remaining frontier is unreachable

    inFrontier.delete(u);
    finalized.add(u);
    visited.push(u);
    if (pred[u] !== null) usedEdges.push({ from: pred[u], to: u });

    for (const { to, weight } of getNeighbors(graph, u)) {
      if (finalized.has(to)) continue;
      const w = typeof weight === 'number' ? weight : 1;   // missing weight = 1
      const nd = dist[u] + w;
      if (nd < dist[to]) {
        dist[to] = nd;
        pred[to] = u;
        inFrontier.add(to);
      }
    }

    rec.push(createStep({
      visited, frontier: [...inFrontier], current: u, edgesUsed: usedEdges,
      extra: { distances: { ...dist } },
    }));
  }

  return rec.steps;
}
