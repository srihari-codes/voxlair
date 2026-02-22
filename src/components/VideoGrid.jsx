import VideoTile from './VideoTile';

/**
 * VideoGrid — arranges all video tiles in a responsive CSS grid.
 */
export default function VideoGrid({ localStream, remoteStreams, myPeerId }) {
  const remotePeerIds = Object.keys(remoteStreams);
  const totalCount = 1 + remotePeerIds.length;

  return (
    <div className="video-grid" data-count={Math.min(totalCount, 9)}>
      {/* Local tile always first */}
      <VideoTile
        stream={localStream}
        label={myPeerId ? myPeerId.slice(0, 8) + '…' : 'You'}
        isLocal={true}
      />

      {/* Remote peers */}
      {remotePeerIds.map((peerId) => (
        <VideoTile
          key={peerId}
          stream={remoteStreams[peerId]}
          label={peerId.slice(0, 8) + '…'}
          isLocal={false}
        />
      ))}
    </div>
  );
}
