import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';

const HOST_PEER_ID = 'videoroom-host-anchor-2024';

// ── PeerServer config ─────────────────────────────────────────────────────
// Dev:  Vite on :5173, PeerServer (Express) on :9000  → use VITE_PEER_PORT
// Prod: Both served by same Express server on Render   → use window.location
const isSecure = window.location.protocol === 'https:';
const prodPort = Number(window.location.port) || (isSecure ? 443 : 80);

const PEER_SERVER = {
  host: window.location.hostname,
  // In dev VITE_PEER_PORT=9000 is set via .env; in prod it's unset so we use the page's port
  port: import.meta.env.VITE_PEER_PORT ? Number(import.meta.env.VITE_PEER_PORT) : prodPort,
  path: '/peerjs',
  secure: isSecure,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
  debug: 1,
};

export function useVideoCall() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [myPeerId, setMyPeerId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isHostRef = useRef(false);

  // All peer IDs we know about (host tracks guests; guests use this too for re-election)
  const knownPeerIdsRef = useRef([]);
  // Open data channels keyed by peer ID
  const dataConnsRef = useRef({});
  // Open media connections keyed by peer ID
  const mediaConnsRef = useRef({});

  // ─── Stream helpers ───────────────────────────────────────────────────────

  const addRemoteStream = useCallback((peerId, stream) => {
    setRemoteStreams(prev => ({ ...prev, [peerId]: stream }));
  }, []);

  const removeRemoteStream = useCallback((peerId) => {
    setRemoteStreams(prev => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    knownPeerIdsRef.current = knownPeerIdsRef.current.filter(id => id !== peerId);
  }, []);

  // ─── Answer an incoming media call ───────────────────────────────────────

  const setupMediaAnswer = useCallback((call) => {
    if (mediaConnsRef.current[call.peer]) return;
    mediaConnsRef.current[call.peer] = call;
    call.answer(localStreamRef.current);
    call.on('stream', stream => addRemoteStream(call.peer, stream));
    call.on('close', () => {
      removeRemoteStream(call.peer);
      delete mediaConnsRef.current[call.peer];
    });
    call.on('error', err => console.error('Media answer error:', err));
  }, [addRemoteStream, removeRemoteStream]);

  // ─── Call a peer with our local stream ───────────────────────────────────

  const callPeer = useCallback((peerId) => {
    if (!peerRef.current || !localStreamRef.current) return;
    if (mediaConnsRef.current[peerId]) return;
    const call = peerRef.current.call(peerId, localStreamRef.current);
    if (!call) return;
    mediaConnsRef.current[peerId] = call;
    call.on('stream', stream => addRemoteStream(peerId, stream));
    call.on('close', () => {
      removeRemoteStream(peerId);
      delete mediaConnsRef.current[peerId];
    });
    call.on('error', err => console.error('Call error:', err));
  }, [addRemoteStream, removeRemoteStream]);

  // ─── HOST: handle incoming data connection from a guest ──────────────────

  const handleHostDataConnection = useCallback((conn) => {
    conn.on('open', () => {
      dataConnsRef.current[conn.peer] = conn;

      // Send the current guest list to the new joiner
      const peerList = knownPeerIdsRef.current.filter(id => id !== conn.peer);
      conn.send({ type: 'PEER_LIST', peers: peerList });

      // Register new guest
      knownPeerIdsRef.current.push(conn.peer);

      // Broadcast to existing guests: new peer just joined
      knownPeerIdsRef.current.forEach(id => {
        if (id !== conn.peer && dataConnsRef.current[id]) {
          dataConnsRef.current[id].send({ type: 'NEW_PEER', peerId: conn.peer });
        }
      });

      // ← THE KEY FIX: host calls the new guest with its own video stream
      callPeer(conn.peer);
    });

    conn.on('close', () => {
      const leftId = conn.peer;
      delete dataConnsRef.current[leftId];
      removeRemoteStream(leftId);

      // Notify remaining guests
      knownPeerIdsRef.current.forEach(id => {
        if (dataConnsRef.current[id]) {
          dataConnsRef.current[id].send({ type: 'PEER_LEFT', peerId: leftId });
        }
      });
      knownPeerIdsRef.current = knownPeerIdsRef.current.filter(id => id !== leftId);
    });

    conn.on('error', err => console.error('Host data conn error:', err));
  }, [removeRemoteStream, callPeer]);

  // ─── Become the host (used initially AND on re-election) ─────────────────

  const becomeHost = useCallback((existingPeer = null) => {
    // If we already have a peer object (re-election case), we need a fresh one
    // with the fixed host ID. destroy the old one first.
    if (existingPeer) {
      existingPeer.destroy();
      peerRef.current = null;
    }

    const peer = new Peer(HOST_PEER_ID, PEER_SERVER);
    peerRef.current = peer;

    peer.on('open', (id) => {
      isHostRef.current = true;
      setMyPeerId(id);
      setStatus('connected');

      // Seed the known peer list from any still-open media connections
      // (important when re-electing: we already have streams from other guests)
      knownPeerIdsRef.current = Object.keys(mediaConnsRef.current);

      peer.on('connection', handleHostDataConnection);
      peer.on('call', setupMediaAnswer);

      console.log('[VideoRoom] I am now the HOST');
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // Another guest won the re-election race — join them as guest
        console.log('[VideoRoom] Lost re-election race, joining winner as guest');
        peer.destroy();
        peerRef.current = null;
        joinAsGuest();
      } else {
        console.error('Host peer error:', err);
        setStatus('error');
        setError(`Connection error: ${err.message}`);
      }
    });
  }, [handleHostDataConnection, setupMediaAnswer]); // joinAsGuest added below via ref trick

  // ─── Re-election: called when the current host disconnects ───────────────
  // We use a random jitter so not all guests slam the server simultaneously.
  const triggerReElection = useCallback(() => {
    const jitter = Math.random() * 1200; // 0–1200ms random delay
    console.log(`[VideoRoom] Host gone. Re-electing in ${Math.round(jitter)}ms…`);
    setTimeout(() => {
      becomeHost(null); // peerRef is still alive (as guest), destroy inside becomeHost
    }, jitter);
  }, [becomeHost]);

  // ─── GUEST: join an existing room ────────────────────────────────────────

  const joinAsGuest = useCallback(() => {
    const peer = new Peer(PEER_SERVER);
    peerRef.current = peer;

    peer.on('open', (id) => {
      isHostRef.current = false;
      setMyPeerId(id);
      setStatus('connected');
      console.log('[VideoRoom] Joined as GUEST, my ID:', id);

      // Open data channel to host to get peer list
      const conn = peer.connect(HOST_PEER_ID, { reliable: true });
      dataConnsRef.current[HOST_PEER_ID] = conn;

      conn.on('open', () => {
        conn.on('data', (data) => {
          if (data.type === 'PEER_LIST') {
            // New joiner calls all existing peers — they will just answer us.
            // Only ONE side initiates to avoid simultaneous-call race condition.
            data.peers.forEach(peerId => callPeer(peerId));
          } else if (data.type === 'NEW_PEER') {
            // A new peer joined — do NOT call them back here.
            // The new peer will call us (via their PEER_LIST), and we'll answer.
            // Calling from both sides simultaneously causes streams to be dropped.
            console.log('[VideoRoom] New peer joined:', data.peerId, '— they will call us');
          } else if (data.type === 'PEER_LEFT') {
            removeRemoteStream(data.peerId);
          }
        });
      });

      conn.on('close', () => {
        console.warn('[VideoRoom] Host disconnected — starting re-election');
        delete dataConnsRef.current[HOST_PEER_ID];
        removeRemoteStream(HOST_PEER_ID);
        // Don't destroy our peer — keep existing media streams alive
        // then race to become new host
        triggerReElection();
      });

      conn.on('error', err => console.error('Guest→host data conn error:', err));

      // Listen for incoming media calls from other peers
      peer.on('call', setupMediaAnswer);
    });

    peer.on('error', (err) => {
      console.error('Guest peer error:', err);
      setStatus('error');
      setError(`Connection error: ${err.message}`);
    });
  }, [callPeer, removeRemoteStream, setupMediaAnswer, triggerReElection]);

  // ─── Entry point ─────────────────────────────────────────────────────────

  const startCall = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    // 1. Get local media
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch {
      setStatus('error');
      setError('Camera / microphone access was denied. Please allow permissions and refresh.');
      return;
    }

    // 2. Try to claim the host ID; fall back to guest on unavailable-id
    const peer = new Peer(HOST_PEER_ID, PEER_SERVER);
    peerRef.current = peer;

    peer.on('open', (id) => {
      isHostRef.current = true;
      setMyPeerId(id);
      setStatus('connected');
      peer.on('connection', handleHostDataConnection);
      peer.on('call', setupMediaAnswer);
      console.log('[VideoRoom] I am the initial HOST');
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer.destroy();
        peerRef.current = null;
        joinAsGuest();
      } else {
        console.error('Initial peer error:', err);
        setStatus('error');
        setError(`Connection error: ${err.message}`);
      }
    });
  }, [handleHostDataConnection, setupMediaAnswer, joinAsGuest]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return { localStream, remoteStreams, myPeerId, status, error, startCall };
}
