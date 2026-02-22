import { useState } from 'react';
import { useVideoCall } from './hooks/useVideoCall';
import PermissionScreen from './components/PermissionScreen';
import VideoGrid from './components/VideoGrid';
import Controls from './components/Controls';

export default function App() {
  const { localStream, remoteStreams, myPeerId, status, error, startCall } = useVideoCall();
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const inCall = status === 'connected' && localStream;
  const remoteCount = Object.keys(remoteStreams).length;

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setMicMuted(m => !m);
  };

  const toggleCam = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setCamOff(c => !c);
  };

  return (
    <div className="app">
      {!inCall ? (
        <PermissionScreen onJoin={startCall} status={status} error={error} />
      ) : (
        <>
          {/* Header bar */}
          <header className="call-header">
            <div className="call-logo">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
              </svg>
              VideoRoom
            </div>
            <div className="call-meta">
              <span className="live-badge">● LIVE</span>
              <span className="participant-count">
                {1 + remoteCount} participant{1 + remoteCount !== 1 ? 's' : ''}
              </span>
            </div>
          </header>

          {/* Video grid */}
          <main className="call-main">
            <VideoGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              myPeerId={myPeerId}
            />

            {/* Empty room hint */}
            {remoteCount === 0 && (
              <div className="waiting-hint">
                <span className="pulse-ring" />
                Waiting for others to join… Share this page's URL to invite them.
              </div>
            )}
          </main>

          {/* Controls */}
          <Controls
            micMuted={micMuted}
            camOff={camOff}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
          />
        </>
      )}
    </div>
  );
}
