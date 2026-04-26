import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

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

  // API Route: EmailJS Proxy to bypass client-side adblockers
  app.post('/api/emailjs/proxy', async (req, res) => {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': req.headers.origin || 'http://localhost:3000',
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': req.headers.referer || 'http://localhost:3000/'
        },
        body: JSON.stringify(req.body)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return res.status(response.status).send(responseText);
      }
      
      res.status(200).send(responseText || 'OK');
    } catch (e: any) {
      console.error('EmailJS Proxy Error:', e);
      res.status(500).json({ error: e.message || 'Failed to send from EmailJS' });
    }
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
