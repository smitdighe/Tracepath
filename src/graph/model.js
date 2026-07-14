// Core graph data structure and adjacency helpers.

export function createGraph(nodes, edges, { directed = false, weighted = false } = {}) {
  const adjacency = new Map();

  // seed every node so isolated nodes still appear in adjacency
  for (const node of nodes) {
    if (!adjacency.has(node.id)) adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const weight = weighted && typeof edge.weight === 'number' ? edge.weight : 1;

    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push({ to: edge.to, weight });

    if (!directed) {
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
      adjacency.get(edge.to).push({ to: edge.from, weight });
    }
  }

  return { nodes, edges, directed, weighted, adjacency };
}

export function getNeighbors(graph, nodeId) {
  return graph.adjacency.get(nodeId) || [];
}
