// Single source of algorithm metadata, shared by App and AlgorithmSelect so
// the option list and the run/label logic can never drift apart.

import { bfs } from './bfs.js';
import { dfs } from './dfs.js';
import { dijkstra } from './dijkstra.js';
import { topoSort } from './topoSort.js';
import { dagLongestPath } from './dagLongestPath.js';

export const ALGORITHMS = [
  { value: 'bfs', label: 'BFS', fn: bfs, frontierLabel: 'Queue', usesStart: true, needsDirected: false },
  { value: 'dfs', label: 'DFS', fn: dfs, frontierLabel: 'Stack', usesStart: true, needsDirected: false },
  { value: 'dijkstra', label: 'Dijkstra', fn: dijkstra, frontierLabel: 'Priority queue', usesStart: true, needsDirected: true },
  { value: 'topo', label: 'Topological Sort', fn: topoSort, frontierLabel: 'Ready set', usesStart: false, needsDirected: true },
  { value: 'longest', label: 'DAG Longest Path', fn: dagLongestPath, frontierLabel: 'Ready set', usesStart: true, needsDirected: true },
];

export function getAlgorithm(value) {
  return ALGORITHMS.find((a) => a.value === value) || ALGORITHMS[0];
}
