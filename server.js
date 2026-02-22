// Combined server: Express + PeerServer + static frontend serving
// ─── In production (Render): serves built Vite dist/ AND PeerServer on same port
// ─── In dev: only PeerServer runs here (Vite runs separately on 5173)
import express from 'express';
import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 9000;

const app = express();
const httpServer = createServer(app);

// ── PeerServer mounted at /peerjs ─────────────────────────────────────────
const peerServer = ExpressPeerServer(httpServer, {
  path: '/',
  corsOptions: { origin: '*' },
});

app.use('/peerjs', peerServer);

peerServer.on('connection', (client) => {
  console.log(`[PeerServer] ✅ Connected:    ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`[PeerServer] ❌ Disconnected: ${client.getId()}`);
});

// ── Serve Vite build in production ────────────────────────────────────────
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback — serve index.html for any route not matched above
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
  console.log(`[Server] Serving static files from ${distPath}`);
} else {
  console.log('[Server] No dist/ found — running in dev mode (Vite handles frontend)');
}

httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] PeerServer at http://localhost:${PORT}/peerjs`);
});
