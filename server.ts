import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Site File Persistence Directories
  const DATA_DIR = path.join(__dirname, 'data');
  const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
  const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const readJson = (file: string, fallback: any[] = []) => {
    try {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
        return fallback;
      }
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
      return fallback;
    }
  };

  const writeJson = (file: string, data: any) => {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error(`Error writing ${file}:`, e);
      return false;
    }
  };

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Maria Style Server',
      serverTime: new Date().toISOString(),
      leadsCount: readJson(LEADS_FILE).length,
      bookingsCount: readJson(BOOKINGS_FILE).length,
    });
  });

  // ==========================================
  // MLM LEADS FILE PERSISTENCE API
  // ==========================================
  app.get('/api/leads', (_req, res) => {
    const leads = readJson(LEADS_FILE, []);
    res.json(leads);
  });

  app.post('/api/leads', (req, res) => {
    const leads = readJson(LEADS_FILE, []);
    const newLead = {
      ...req.body,
      id: req.body.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      synced: true,
    };
    // Prepend to top
    leads.unshift(newLead);
    writeJson(LEADS_FILE, leads);
    res.status(201).json({ success: true, lead: newLead });
  });

  app.put('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const leads = readJson(LEADS_FILE, []);
    const index = leads.findIndex((l: any) => l.id === id);
    if (index === -1) {
      const newLead = { ...req.body, id, updatedAt: new Date().toISOString() };
      leads.unshift(newLead);
      writeJson(LEADS_FILE, leads);
      return res.json({ success: true, lead: newLead });
    }
    leads[index] = { ...leads[index], ...req.body, updatedAt: new Date().toISOString() };
    writeJson(LEADS_FILE, leads);
    res.json({ success: true, lead: leads[index] });
  });

  app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    let leads = readJson(LEADS_FILE, []);
    leads = leads.filter((l: any) => l.id !== id);
    writeJson(LEADS_FILE, leads);
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ==========================================
  // BOOKINGS FILE PERSISTENCE API
  // ==========================================
  app.get('/api/bookings', (_req, res) => {
    const bookings = readJson(BOOKINGS_FILE, []);
    res.json(bookings);
  });

  app.post('/api/bookings', (req, res) => {
    const bookings = readJson(BOOKINGS_FILE, []);
    const newBooking = {
      ...req.body,
      id: req.body.id || `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      synced: true,
    };
    bookings.unshift(newBooking);
    writeJson(BOOKINGS_FILE, bookings);
    res.status(201).json({ success: true, booking: newBooking });
  });

  app.put('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const bookings = readJson(BOOKINGS_FILE, []);
    const index = bookings.findIndex((b: any) => b.id === id);
    if (index === -1) {
      const newBooking = { ...req.body, id, updatedAt: new Date().toISOString() };
      bookings.unshift(newBooking);
      writeJson(BOOKINGS_FILE, bookings);
      return res.json({ success: true, booking: newBooking });
    }
    bookings[index] = { ...bookings[index], ...req.body, updatedAt: new Date().toISOString() };
    writeJson(BOOKINGS_FILE, bookings);
    res.json({ success: true, booking: bookings[index] });
  });

  app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    let bookings = readJson(BOOKINGS_FILE, []);
    bookings = bookings.filter((b: any) => b.id !== id);
    writeJson(BOOKINGS_FILE, bookings);
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ==========================================
  // VITE DEV SERVER OR PRODUCTION STATIC FILES
  // ==========================================
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maria Style server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
