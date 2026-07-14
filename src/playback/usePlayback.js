import { useCallback, useEffect, useRef, useState } from 'react';
import { nextIndex, prevIndex } from './playbackControls.js';

// Playback state machine over a step[] array. The interval is owned entirely
// by a single effect keyed on [isPlaying, speed, steps]; its cleanup is the
// one place the timer is cleared, so pause, unmount, speed change, steps
// change, and reaching the end all tear the timer down the same way.

const MIN_SPEED = 0.1; // steps/sec floor so delay stays finite/positive

export function usePlayback(steps, { initialSpeed = 1 } = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(Math.max(initialSpeed, MIN_SPEED));

  const timerRef = useRef(null);

  // Reset to the start (paused) whenever the step array reference changes,
  // i.e. a new algorithm/graph run replaced the steps. React's recommended
  // "adjust state during render" pattern — runs before paint, no effect,
  // no cascading-render lint warning.
  const [prevSteps, setPrevSteps] = useState(steps);
  if (steps !== prevSteps) {
    setPrevSteps(steps);
    setCurrentIndex(0);
    setIsPlaying(false);
  }

  const hasSteps = Array.isArray(steps) && steps.length > 0;
  const currentStep =
    hasSteps && currentIndex >= 0 && currentIndex < steps.length
      ? steps[currentIndex]
      : null;

  // The one and only owner of the interval.
  useEffect(() => {
    if (!isPlaying || !hasSteps) return undefined;

    const delay = 1000 / speed;
    timerRef.current = setInterval(() => {
      setCurrentIndex((idx) => {
        const next = nextIndex(idx, steps.length);
        // landing on (or already at) the last step ends autoplay
        if (next >= steps.length - 1) setIsPlaying(false);
        return next;
      });
    }, delay);

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isPlaying, speed, steps, hasSteps]);

  const play = useCallback(() => {
    if (!hasSteps) return;
    setIsPlaying(true);
  }, [hasSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false); // effect cleanup clears the timer
  }, []);

  const stepForward = useCallback(() => {
    if (!hasSteps) return;
    setIsPlaying(false); // manual step overrides autoplay
    setCurrentIndex((idx) => nextIndex(idx, steps.length));
  }, [hasSteps, steps]);

  const stepBack = useCallback(() => {
    if (!hasSteps) return;
    setIsPlaying(false);
    setCurrentIndex((idx) => prevIndex(idx));
  }, [hasSteps]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const setSpeed = useCallback((n) => {
    const next = Number(n);
    if (!Number.isFinite(next)) return;
    setSpeedState(Math.max(next, MIN_SPEED)); // effect restarts timer w/ new delay
  }, []);

  return {
    currentIndex,
    currentStep,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
  };
}
