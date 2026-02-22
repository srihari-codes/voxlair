/**
 * Controls — bottom action bar with mic/cam toggle buttons.
 */
export default function Controls({ micMuted, camOff, onToggleMic, onToggleCam }) {
  return (
    <div className="controls-bar">
      {/* Mic button */}
      <button
        id="mic-toggle"
        className={`ctrl-btn ${micMuted ? 'active-off' : ''}`}
        onClick={onToggleMic}
        title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {micMuted ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
          </svg>
        )}
        <span className="ctrl-label">{micMuted ? 'Unmute' : 'Mute'}</span>
      </button>

      {/* Camera button */}
      <button
        id="cam-toggle"
        className={`ctrl-btn ${camOff ? 'active-off' : ''}`}
        onClick={onToggleCam}
        title={camOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {camOff ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577A11.217 11.217 0 0112 3.75c4.5 0 8.44 2.677 10.395 6.608a1.5 1.5 0 01.001 1.195z" />
            <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM21.68 17.35l-3.185-3.185A6.767 6.767 0 0115.75 12a6.75 6.75 0 00-6.75-6.75 6.771 6.771 0 00-2.165.352l-2.4-2.4A11.217 11.217 0 0112 2.25c4.874 0 9.028 3.012 10.808 7.328.386.942.386 1.975-.001 2.916a13.57 13.57 0 01-1.127 2.856z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
          </svg>
        )}
        <span className="ctrl-label">{camOff ? 'Start Video' : 'Stop Video'}</span>
      </button>

      {/* Divider */}
      <div className="ctrl-divider" />

      {/* Share URL button */}
      <button
        id="share-btn"
        className="ctrl-btn share-btn"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
        }}
        title="Copy invite link"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
        </svg>
        <span className="ctrl-label">Copy Link</span>
      </button>
    </div>
  );
}
