import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db.js';
import { apiRouter } from './server/routes.js';

function listenWithFallback(app: express.Express, preferredPort: number) {
  return new Promise<number>((resolve, reject) => {
    const candidatePorts = [preferredPort, preferredPort + 1, preferredPort + 2, preferredPort + 3, preferredPort + 4];
    let portIndex = 0;

    const tryListen = () => {
      const port = candidatePorts[portIndex];
      const server = app.listen(port, '0.0.0.0', () => {
        console.log(`[BGMI SHOWDOWN] Server running on http://0.0.0.0:${port}`);
        resolve(port);
      });

      server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE' && portIndex < candidatePorts.length - 1) {
          portIndex += 1;
          tryListen();
          return;
        }

        reject(err);
      });
    };

    tryListen();
  });
}

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT) || 3001;

  // Verify the configured Supabase schema before accepting requests.
  await initDatabase();

  // Standard Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', tournament: 'BGMI SHOWDOWN', time: new Date().toISOString() });
  });

  // API Routes (Mounted FIRST)
  app.use('/api', apiRouter);

  // Vite Middleware Setup for dev vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await listenWithFallback(app, preferredPort);
}

startServer().catch(err => {
  console.error('[BGMI SHOWDOWN] Server startup failed:', err);
  process.exit(1);
});
