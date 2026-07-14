import { getNeighbors } from './model.js';

// Structural validation, cycle detection, and connected components.
export function validateGraph(graph) {
  const errors = [];

  if (graph.nodes.length === 0) {
    errors.push('Empty node list');
  }

  const ids = new Set();
  for (const node of graph.nodes) {
    if (ids.has(node.id)) {
      errors.push(`Duplicate node id: ${node.id}`);
    }
    ids.add(node.id);
  }

  for (const edge of graph.edges) {
    if (!ids.has(edge.from)) {
      errors.push(`Edge references missing node: ${edge.from}`);
    }
    if (!ids.has(edge.to)) {
      errors.push(`Edge references missing node: ${edge.to}`);
    }
    if (edge.from === edge.to) {
      errors.push(`Warning: self-loop on ${edge.from}`);
    }
  }

  // self-loop warnings don't invalidate the graph
  const hardErrors = errors.filter((e) => !e.startsWith('Warning:'));
  return { valid: hardErrors.length === 0, errors };
}

export function hasCycle(graph) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  for (const node of graph.nodes) color.set(node.id, WHITE);

  function dfs(id) {
    color.set(id, GRAY);
    for (const { to } of getNeighbors(graph, id)) {
      const c = color.get(to);
      if (c === GRAY) return true;      // back edge
      if (c === WHITE && dfs(to)) return true;
    }
    color.set(id, BLACK);
    return false;
  }

  for (const node of graph.nodes) {
    if (color.get(node.id) === WHITE && dfs(node.id)) return true;
  }
  return false;
}

export function getConnectedComponents(graph) {
  // treat as undirected for reachability
  const undirected = new Map();
  for (const node of graph.nodes) undirected.set(node.id, new Set());
  for (const edge of graph.edges) {
    if (undirected.has(edge.from)) undirected.get(edge.from).add(edge.to);
    if (undirected.has(edge.to)) undirected.get(edge.to).add(edge.from);
  }

  const seen = new Set();
  const components = [];

  for (const node of graph.nodes) {
    if (seen.has(node.id)) continue;
    const stack = [node.id];
    const component = [];
    seen.add(node.id);
    while (stack.length) {
      const id = stack.pop();
      component.push(id);
      for (const next of undirected.get(id) || []) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
    components.push(component);
  }

  return components;
}
