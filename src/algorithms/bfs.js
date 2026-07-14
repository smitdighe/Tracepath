// BFS with queue frontier.
// Edge case handled: disconnected graphs. After a component drains, the seed
// loop restarts from the next unvisited node (graph order), so every node is
// reached instead of stopping at startId's component.

import { getNeighbors } from '../graph/model.js';
import { createStep, recordSteps } from './stepRecorder.js';

export function bfs(graph, startId) {
  const rec = recordSteps();
  const ids = graph.nodes.map((n) => n.id);
  const nodeSet = new Set(ids);

  const seen = new Set();   // enqueued-or-processed, prevents duplicates
  const visited = [];       // processed order
  const queue = [];         // frontier (FIFO)
  const usedEdges = [];     // BFS tree edges

  for (const seed of seedOrder(ids, startId, nodeSet)) {
    if (seen.has(seed)) continue;
    seen.add(seed);
    queue.push(seed);
    rec.push(createStep({ visited, frontier: queue, current: null, edgesUsed: usedEdges }));

    while (queue.length > 0) {
      const current = queue.shift();
      visited.push(current);
      for (const { to } of getNeighbors(graph, current)) {
        if (!seen.has(to)) {
          seen.add(to);
          queue.push(to);
          usedEdges.push({ from: current, to });
        }
      }
      rec.push(createStep({ visited, frontier: queue, current, edgesUsed: usedEdges }));
    }
  }

  if (rec.steps.length === 0) {
    rec.push(createStep({ visited: [], frontier: [], current: null, edgesUsed: [] }));
  }
  return rec.steps;
}

function seedOrder(ids, startId, nodeSet) {
  const seeds = [];
  if (startId != null && nodeSet.has(startId)) seeds.push(startId);
  for (const id of ids) if (id !== startId) seeds.push(id);
  return seeds;
}
