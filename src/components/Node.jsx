import { motion } from 'framer-motion';
import { getNodeColor } from '../utils/colors.js';
import { nodeVariants, frontierPulse, nodeEntrance } from '../styles/motion.js';

const RADIUS = 24;

// state: 'idle' | 'visited' | 'frontier' | 'current'
// Two layers of motion, kept separate on purpose:
//   - the <g> handles the one-time staggered entrance (index-based delay)
//   - the inner <circle> handles per-step state transitions via variants
// Nodes persist for the whole run (never mount/unmount mid-playback), so state
// changes animate purely through variants + animate — no AnimatePresence.
export default function Node({ id, label, x, y, state = 'idle', index = 0 }) {
  const text = label ?? id;
  const brightFill = state === 'frontier' || state === 'current';

  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      data-node-id={id}
      data-state={state}
      initial={nodeEntrance.initial}
      animate={nodeEntrance.animate}
      transition={nodeEntrance.transition(index)}
    >
      <motion.circle
        r={RADIUS}
        strokeWidth={2}
        variants={nodeVariants}
        animate={state}
        initial={false}
        filter={state === 'current' ? 'url(#node-glow)' : undefined}
      />

      {/* pulsing ring layered on top of the frontier variant */}
      {state === 'frontier' && (
        <motion.circle
          r={RADIUS}
          fill="none"
          stroke={getNodeColor('frontier')}
          animate={frontierPulse.animate}
          transition={frontierPulse.transition}
        />
      )}

      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={600}
        fontFamily="var(--font-mono)"
        fill={brightFill ? 'var(--text-on-accent)' : 'var(--text-hi)'}
      >
        {text}
      </text>
    </motion.g>
  );
}
