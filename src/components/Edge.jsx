import { motion } from 'framer-motion';
import { getEdgeColor } from '../utils/colors.js';
import { edgeTraceTransition } from '../styles/motion.js';

// Arrowhead marker id defined once in GraphCanvas's <defs>.
export const ARROW_MARKER_ID = 'tracepath-arrow';

export default function Edge({ fromX, fromY, toX, toY, traversed = false, directed = false }) {
  const length = Math.hypot(toX - fromX, toY - fromY);

  return (
    <g>
      {/* faint static line: keeps graph structure readable before traversal */}
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={getEdgeColor(false)}
        strokeWidth={2}
        markerEnd={directed ? `url(#${ARROW_MARKER_ID})` : undefined}
      />

      {/* accent trace draws on when traversed (dashoffset length -> 0).
          Reverse (traversed true -> false, e.g. stepBack) snaps instantly with
          duration 0 so the draw-on animation never plays backwards. */}
      <motion.line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={getEdgeColor(true)}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={length}
        initial={false}
        animate={{ strokeDashoffset: traversed ? 0 : length }}
        transition={traversed ? edgeTraceTransition : { duration: 0 }}
      />
    </g>
  );
}
