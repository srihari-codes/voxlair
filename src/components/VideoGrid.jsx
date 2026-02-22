import { useState } from 'react';
import VideoTile from './VideoTile';

/**
 * VideoGrid — Google Meet / Zoom style responsive layout.
 *
 * Behaviour matrix:
 *  1 participant  →  full-area local tile (solo)
 *  2 participants →  remote(s) fill main area, local is a floating PiP (bottom-right)
 *  3+ participants→  main stage grid for all tiles, click any to spotlight it
 *                    (spotlighted tile goes full-width, others shown as a strip)
 */
export default function VideoGrid({ localStream, remoteStreams, myPeerId }) {
  const remotePeerIds = Object.keys(remoteStreams);
  const remoteCount   = remotePeerIds.length;
  const totalCount    = 1 + remoteCount;

  // null = no pin; 'local' = local pinned; peerId string = that peer pinned
  const [pinnedId, setPinnedId] = useState(null);

  const handlePin = (id) => {
    setPinnedId(prev => (prev === id ? null : id));
  };

  /* ── SOLO (only me) ───────────────────────────────────────────────────── */
  if (totalCount === 1) {
    return (
      <div className="vg-solo">
        <VideoTile
          stream={localStream}
          label={myPeerId ? myPeerId.slice(0, 8) + '…' : 'You'}
          isLocal
        />
      </div>
    );
  }

  /* ── 1 REMOTE + ME  →  spotlight + PiP ───────────────────────────────── */
  if (totalCount === 2) {
    const peerId = remotePeerIds[0];
    return (
      <div className="vg-spotlight-container">
        {/* Main spotlight: the single remote peer */}
        <div className="vg-spotlight">
          <VideoTile
            stream={remoteStreams[peerId]}
            label={peerId.slice(0, 8) + '…'}
            isLocal={false}
          />
        </div>

        {/* Floating PiP: me */}
        <div className="vg-pip">
          <VideoTile
            stream={localStream}
            label="You"
            isLocal
            isFloating
          />
        </div>
      </div>
    );
  }

  /* ── 3+ PARTICIPANTS ─────────────────────────────────────────────────── */

  // Build ordered tile list: remote first (they are the "stars"), local last
  const allTiles = [
    ...remotePeerIds.map(id => ({ id, stream: remoteStreams[id], isLocal: false })),
    { id: 'local', stream: localStream, isLocal: true },
  ];

  const pinnedTile  = pinnedId ? allTiles.find(t => t.id === pinnedId) : null;
  const stripTiles  = pinnedTile ? allTiles.filter(t => t.id !== pinnedId) : [];

  /* ── SPOTLIGHT MODE (someone is pinned) ── */
  if (pinnedTile) {
    return (
      <div className="vg-pinned-container">
        {/* Big spotlight */}
        <div className="vg-pinned-main">
          <VideoTile
            stream={pinnedTile.stream}
            label={pinnedTile.isLocal
              ? (myPeerId ? myPeerId.slice(0, 8) + '…' : 'You')
              : pinnedTile.id.slice(0, 8) + '…'}
            isLocal={pinnedTile.isLocal}
            isPinned
            onClick={() => handlePin(pinnedTile.id)}
          />
        </div>

        {/* Horizontal thumbnail strip */}
        <div className="vg-strip" data-strip-count={Math.min(stripTiles.length, 6)}>
          {stripTiles.map(t => (
            <div key={t.id} className="vg-strip-tile">
              <VideoTile
                stream={t.stream}
                label={t.isLocal
                  ? (myPeerId ? myPeerId.slice(0, 8) + '…' : 'You')
                  : t.id.slice(0, 8) + '…'}
                isLocal={t.isLocal}
                onClick={() => handlePin(t.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── GRID MODE (no pin) ── */
  const cappedCount = Math.min(totalCount, 9);
  return (
    <div className="vg-grid" data-count={cappedCount}>
      {allTiles.map(t => (
        <VideoTile
          key={t.id}
          stream={t.stream}
          label={t.isLocal
            ? (myPeerId ? myPeerId.slice(0, 8) + '…' : 'You')
            : t.id.slice(0, 8) + '…'}
          isLocal={t.isLocal}
          onClick={() => handlePin(t.id)}
        />
      ))}
    </div>
  );
}
