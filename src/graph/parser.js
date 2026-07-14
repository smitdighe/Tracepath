import { createGraph } from './model.js';

// Parse either JSON or adjacency-list text into a graph. Never throws.
export function parseGraphInput(rawText) {
  if (typeof rawText !== 'string' || rawText.trim() === '') {
    return { graph: null, error: 'Empty input' };
  }

  const text = rawText.trim();

  // JSON format: starts with { or [
  if (text[0] === '{' || text[0] === '[') {
    return parseJson(text);
  }

  return parseAdjacencyList(text);
}

function parseJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { graph: null, error: `Invalid JSON: ${e.message}` };
  }

  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return { graph: null, error: 'JSON must have "nodes" and "edges" arrays' };
  }

  const weighted = data.edges.some((e) => typeof e.weight === 'number');
  const directed = data.directed === true;
  const graph = createGraph(data.nodes, data.edges, { directed, weighted });
  return { graph, error: null };
}

function parseAdjacencyList(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
  const nodeIds = new Set();
  const edges = [];
  let weighted = false;

  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon === -1) {
      return { graph: null, error: `Malformed line (missing ':'): ${line}` };
    }

    const from = line.slice(0, colon).trim();
    if (from === '') {
      return { graph: null, error: `Malformed line (empty node id): ${line}` };
    }
    nodeIds.add(from);

    const rest = line.slice(colon + 1).trim();
    if (rest === '') continue; // node with no neighbors

    for (const part of rest.split(',')) {
      const token = part.trim();
      if (token === '') continue;

      const match = token.match(/^([^()]+?)(?:\(([^()]*)\))?$/);
      if (!match) {
        return { graph: null, error: `Malformed neighbor: ${token}` };
      }

      const to = match[1].trim();
      if (to === '') {
        return { graph: null, error: `Malformed neighbor (empty id): ${token}` };
      }

      let weight = 1;
      if (match[2] !== undefined) {
        const w = Number(match[2].trim());
        if (Number.isNaN(w)) {
          return { graph: null, error: `Invalid weight in: ${token}` };
        }
        weight = w;
        weighted = true;
      }

      nodeIds.add(to);
      edges.push({ from, to, weight });
    }
  }

  const nodes = [...nodeIds].map((id) => ({ id }));
  const graph = createGraph(nodes, edges, { directed: true, weighted });
  return { graph, error: null };
}
