// Standard step shape + immutable accumulator used by every algorithm.
// Edge case handled: distance maps hold Infinity / -Infinity, which JSON
// clone would corrupt into null. deepClone below passes numbers through
// untouched so each step keeps a faithful, independent snapshot.

export function createStep({ visited, frontier, current = null, edgesUsed = [], extra = {} }) {
  return {
    visited: Array.from(visited || []),
    frontier: Array.from(frontier || []),
    current: current ?? null,
    edgesUsed: (edgesUsed || []).map((e) => ({ from: e.from, to: e.to })),
    extra,
  };
}

export function recordSteps() {
  const steps = [];
  return {
    steps,
    push(step) {
      // clone every array/object so later mutation of live state never
      // reaches back into previously recorded steps
      steps.push({
        visited: Array.from(step.visited || []),
        frontier: Array.from(step.frontier || []),
        current: step.current ?? null,
        edgesUsed: (step.edgesUsed || []).map((e) => ({ from: e.from, to: e.to })),
        extra: deepClone(step.extra || {}),
      });
      return step;
    },
  };
}

function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = deepClone(value[key]);
    return out;
  }
  return value; // primitives incl. Infinity / -Infinity pass through intact
}
