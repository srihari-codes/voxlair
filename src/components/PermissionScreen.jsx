/**
 * PermissionScreen — shown before camera access is granted.
 * Calls onJoin() when the user clicks the join button.
 */
export default function PermissionScreen({ onJoin, status, error }) {
  const isConnecting = status === 'connecting';

  return (
    <div className="permission-screen">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="permission-card">
        {/* Icon */}
        <div className="perm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 014.5 5.25H12a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25z" />
          </svg>
        </div>

        <h1 className="perm-title">Voxlair</h1>
        <p className="perm-subtitle">
          One room. Anyone who visits is instantly in the call.
        </p>

        <ul className="perm-features">
          <li>
            <span className="feat-icon">⚡</span>
            No sign-up, no install — just press join
          </li>
          <li>
            <span className="feat-icon">🌐</span>
            Share this URL with anyone to invite them
          </li>
        </ul>

        {error && (
          <div className="perm-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          className={`join-btn ${isConnecting ? 'connecting' : ''}`}
          onClick={onJoin}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="spinner" />
              Connecting…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
              </svg>
              Join the Room
            </>
          )}
        </button>

        <p className="perm-note">
          Your browser will ask for camera &amp; microphone permission.
        </p>
      </div>
    </div>
  );
}
