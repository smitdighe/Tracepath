// Longest path in a DAG, relaxed in Kahn topological order (no recursion).
// Edge case handled: nodes unreachable from startId. They keep dist -Infinity
// and never relax onward (relaxation is gated on a finite source), so the
// start-relative longest-path tree stays correct even on disconnected DAGs.
// Cyclic input bails out early like topoSort.

import { getNeighbors } from '../graph/model.js';
import { hasCycle } from '../graph/validate.js';
import { createStep, recordSteps } from './stepRecorder.js';

export function dagLongestPath(graph, startId) {
  const rec = recordSteps();

  if (hasCycle(graph)) {
    rec.push(createStep({
      visited: [], frontier: [], current: null, edgesUsed: [],
      extra: { error: 'cycle detected', distances: {}, predecessor: {} },
    }));
    return rec.steps;
  }

  const ids = graph.nodes.map((n) => n.id);
  const nodeSet = new Set(ids);

  const dist = {};
  const pred = {};
  for (const id of ids) { dist[id] = -Infinity; pred[id] = null; }
  if (startId != null && nodeSet.has(startId)) dist[startId] = 0;

  const indeg = {};
  for (const id of ids) indeg[id] = 0;
  for (const edge of graph.edges) {
    if (nodeSet.has(edge.from) && nodeSet.has(edge.to)) indeg[edge.to] += 1;
  }

  const ready = ids.filter((id) => indeg[id] === 0);   // ready-set = frontier
  const processed = [];

  rec.push(createStep({
    visited: processed, frontier: ready, current: null, edgesUsed: treeEdges(pred),
    extra: { distances: { ...dist }, predecessor: { ...pred } },
  }));

  while (ready.length > 0) {
    const u = ready.shift();
    processed.push(u);

    for (const { to, weight } of getNeighbors(graph, u)) {
      if (!nodeSet.has(to)) continue;
      const w = typeof weight === 'number' ? weight : 1;   // missing weight = 1
      if (dist[u] !== -Infinity) {
        const nd = dist[u] + w;
        if (nd > dist[to]) { dist[to] = nd; pred[to] = u; }
      }
      indeg[to] -= 1;
      if (indeg[to] === 0) ready.push(to);
    }

    rec.push(createStep({
      visited: processed, frontier: ready, current: u, edgesUsed: treeEdges(pred),
      extra: { distances: { ...dist }, predecessor: { ...pred } },
    }));
  }

  return rec.steps;
}

function treeEdges(pred) {
  const edges = [];
  for (const to of Object.keys(pred)) {
    if (pred[to] !== null) edges.push({ from: pred[to], to });
  }
  return edges;
}
