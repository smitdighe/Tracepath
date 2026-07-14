// Pure index math for playback. No React, no timers.

export function clampIndex(index, length) {
  if (length <= 0) return -1;          // empty step list has no valid index
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
}

export function nextIndex(index, length) {
  if (length <= 0) return -1;
  return Math.min(index + 1, length - 1);
}

export function prevIndex(index) {
  return Math.max(index - 1, 0);
}
