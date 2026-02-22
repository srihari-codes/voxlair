import { useEffect, useRef } from 'react';

/**
 * VideoTile — renders a single <video> element and attaches a MediaStream to it.
 */
export default function VideoTile({ stream, label, isLocal = false, isMuted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`video-tile ${isLocal ? 'local' : 'remote'}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="video-el"
      />
      <div className="tile-label">
        <span className="status-dot" />
        {label}
        {isLocal && <span className="you-badge">You</span>}
      </div>
    </div>
  );
}
