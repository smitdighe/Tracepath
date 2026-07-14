// framer-motion configs. Colors are pulled from CSS custom properties via
// cssVar so theme.css stays the single source of truth (no hex here).

import { cssVar } from '../utils/colors.js';

const stateTween = { type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1] };

export const nodeVariants = {
  idle: {
    scale: 1,
    fill: cssVar('--node-idle-fill'),
    stroke: cssVar('--node-idle-stroke'),
    transition: stateTween,
  },
  visited: {
    scale: 1,
    fill: cssVar('--node-visited'),
    stroke: cssVar('--node-visited'),
    transition: stateTween,
  },
  frontier: {
    scale: 1.06,
    fill: cssVar('--node-frontier'),
    stroke: cssVar('--accent-strong'),
    transition: stateTween,
  },
  current: {
    scale: 1.18,
    fill: cssVar('--node-current'),
    stroke: cssVar('--accent-strong'),
    // precise, near-critically damped — a crisp settle, no cartoon overshoot
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.9 },
  },
};

// Staggered entrance: each node scales in ~30ms after the previous one.
export const NODE_STAGGER = 0.03;

export const nodeEntrance = {
  initial: { opacity: 0, scale: 0.4 },
  animate: { opacity: 1, scale: 1 },
  transition: (index = 0) => ({
    delay: index * NODE_STAGGER,
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1], // easeOutExpo — settles without bounce
  }),
};

// Looping ring pulse layered on top of the 'frontier' variant.
export const frontierPulse = {
  animate: { opacity: [0.9, 0.25, 0.9], strokeWidth: [1.5, 6, 1.5], scale: [1, 1.35, 1] },
  transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
};

// stroke-dashoffset draw-on for a traversed edge.
export const edgeTraceTransition = { duration: 0.4, ease: 'easeInOut' };
