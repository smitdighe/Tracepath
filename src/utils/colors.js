// Color accessors. theme.css owns every hex; this module only maps a logical
// state to the right CSS custom property and resolves it to a concrete value
// (so framer-motion can tween between colors). If the DOM/vars aren't present
// yet, it returns the var() expression itself — still valid in the browser,
// never a duplicated literal.

export function cssVar(name) {
  if (typeof document !== 'undefined' && typeof getComputedStyle === 'function') {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (v) return v;
  }
  return `var(${name})`;
}

const NODE_VAR = {
  idle: '--node-idle-stroke',
  visited: '--node-visited',
  frontier: '--node-frontier',
  current: '--node-current',
};

export function getNodeColor(state) {
  return cssVar(NODE_VAR[state] || NODE_VAR.idle);
}

export function getEdgeColor(isTraversed) {
  return cssVar(isTraversed ? '--edge-traversed' : '--edge-idle');
}
