const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <path d="M3 2l9 5-9 5z" />
  </svg>
);
const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <rect x="3" y="2" width="3" height="10" rx="1" />
    <rect x="8" y="2" width="3" height="10" rx="1" />
  </svg>
);
const IconPrev = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <rect x="2" y="2" width="2.5" height="10" rx="1" />
    <path d="M12 2v10L5 7z" />
  </svg>
);
const IconNext = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <path d="M2 2v10l7-5z" />
    <rect x="9.5" y="2" width="2.5" height="10" rx="1" />
  </svg>
);
const IconReset = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M2.5 7a4.5 4.5 0 1 0 1.4-3.3" strokeLinecap="round" />
    <path d="M3 1.5V4h2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PlaybackBar({
  currentIndex,
  isPlaying,
  speed,
  play,
  pause,
  stepForward,
  stepBack,
  reset,
  setSpeed,
  totalSteps,
}) {
  const empty = totalSteps === 0;
  const atStart = empty || currentIndex <= 0;
  const atEnd = empty || currentIndex >= totalSteps - 1;

  return (
    <div className="playbar panel">
      <span className="playbar__counter mono">
        Step {empty ? 0 : currentIndex + 1} / {totalSteps}
      </span>

      <button className="btn btn--icon" onClick={reset} disabled={atStart} title="Reset" aria-label="Reset">
        <IconReset />
      </button>
      <button className="btn btn--icon" onClick={stepBack} disabled={atStart} title="Step back" aria-label="Step back">
        <IconPrev />
      </button>
      <button
        className="btn btn--icon btn--accent"
        onClick={isPlaying ? pause : play}
        disabled={!isPlaying && atEnd}
        title={isPlaying ? 'Pause' : 'Play'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>
      <button className="btn btn--icon" onClick={stepForward} disabled={atEnd} title="Step forward" aria-label="Step forward">
        <IconNext />
      </button>

      <span className="playbar__spacer" />

      <label className="playbar__speed">
        <span>{speed.toFixed(1)}×</span>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Playback speed"
        />
      </label>
    </div>
  );
}
