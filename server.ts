import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Secrets Management (Cleared out for EmailJS transition)
  app.get('/api/secrets', (req, res) => {
    res.json({
      secrets: {}
    });
  });

  app.post('/api/secrets', (req, res) => {
    res.json({ success: true });
  });

  // API Route: Send Notifications
  app.post('/api/notify-admin', async (req, res) => {
    const { emailDestination, whatsappDestination, bookingDetails } = req.body;
    // Cleared out. Waiting for EmailJS integration instructions.
    console.log(`[SIMULATED NOTIFICATION] EmailJS integration pending. Client: ${bookingDetails?.clientName}`);
    res.json({ success: true, sent: ['Simulated'], errors: [] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
