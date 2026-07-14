// DFS with an explicit stack (no recursion).
// Edge case handled: cycles. A node is finalized only when popped, and any
// pop of an already-finalized node is skipped. That terminates on cyclic
// graphs and tolerates the duplicate stack entries iterative DFS produces.

import { getNeighbors } from '../graph/model.js';
import { createStep, recordSteps } from './stepRecorder.js';

export function dfs(graph, startId) {
  const rec = recordSteps();
  const ids = graph.nodes.map((n) => n.id);
  const nodeSet = new Set(ids);

  const visited = [];
  const visitedSet = new Set();
  const stack = [];         // entries { node, from } — frontier
  const usedEdges = [];

  for (const seed of seedOrder(ids, startId, nodeSet)) {
    if (visitedSet.has(seed)) continue;
    stack.push({ node: seed, from: null });
    rec.push(createStep({ visited, frontier: stack.map((e) => e.node), current: null, edgesUsed: usedEdges }));

    while (stack.length > 0) {
      const { node, from } = stack.pop();
      if (visitedSet.has(node)) continue;   // cycle / duplicate guard
      visitedSet.add(node);
      visited.push(node);
      if (from !== null) usedEdges.push({ from, to: node });

      const neighbors = getNeighbors(graph, node);
      // push in reverse so the first neighbor is expanded first (preorder)
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const to = neighbors[i].to;
        if (!visitedSet.has(to)) stack.push({ node: to, from: node });
      }

      rec.push(createStep({ visited, frontier: stack.map((e) => e.node), current: node, edgesUsed: usedEdges }));
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
