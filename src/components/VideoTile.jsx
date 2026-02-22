import { useEffect, useRef, useState } from 'react';

/**
 * VideoTile — renders a single <video> element with expand-on-click support.
 */
export default function VideoTile({
  stream,
  label,
  isLocal = false,
  isMuted = false,
  isPinned = false,
  isFloating = false,
  onClick,
}) {
  const videoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={[
        'video-tile',
        isLocal ? 'local' : 'remote',
        isPinned ? 'pinned' : '',
        isFloating ? 'floating' : '',
      ].filter(Boolean).join(' ')}
      onClick={handleClick}
      title={isPinned ? 'Click to unpin' : 'Click to spotlight'}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="video-el"
      />

      {/* Hover overlay with expand icon */}
      <div className="tile-overlay">
        <span className="tile-expand-icon">
          {isPinned ? (
            // Shrink / exit fullscreen icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0 2-2h3M3 16h3a2 2 0 0 0 2 2v3" />
            </svg>
          ) : (
            // Expand icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          )}
        </span>
      </div>

      <div className="tile-label">
        <span className="status-dot" />
        {label}
        {isLocal && <span className="you-badge">You</span>}
      </div>
    </div>
  );
}
