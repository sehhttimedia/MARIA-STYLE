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

  app.use(express.json({ limit: '15mb' }));

  // Site File Persistence Directories
  const DATA_DIR = path.join(__dirname, 'data');
  const CMS_FILE = path.join(DATA_DIR, 'cms.json');
  const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
  const AWARDS_FILE = path.join(DATA_DIR, 'awards.json');
  const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
  const FORM_CONFIGS_FILE = path.join(DATA_DIR, 'form_configs.json');
  const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
  const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
  const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const readJson = (file: string, fallback: any = null) => {
    try {
      if (!fs.existsSync(file)) {
        if (fallback !== null) {
          fs.writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
        }
        return fallback;
      }
      const raw = fs.readFileSync(file, 'utf-8');
      return JSON.parse(raw);
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

  // ==========================================
  // UNIFIED SITE DATA (ONE-SHOT HYDRATION FOR ALL VISITORS & DEVICES)
  // ==========================================
  app.get('/api/site-data', (_req, res) => {
    const cms = readJson(CMS_FILE, null);
    const products = readJson(PRODUCTS_FILE, []);
    const awards = readJson(AWARDS_FILE, []);
    const members = readJson(MEMBERS_FILE, []);
    const formConfigs = readJson(FORM_CONFIGS_FILE, null);
    const config = readJson(CONFIG_FILE, { activeSheetId: '' });
    const leads = readJson(LEADS_FILE, []);
    const bookings = readJson(BOOKINGS_FILE, []);

    res.json({
      cms,
      products,
      awards,
      members,
      formConfigs,
      config,
      leads,
      bookings,
      timestamp: new Date().toISOString(),
    });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Maria Style Server',
      serverTime: new Date().toISOString(),
      leadsCount: readJson(LEADS_FILE, []).length,
      bookingsCount: readJson(BOOKINGS_FILE, []).length,
      productsCount: readJson(PRODUCTS_FILE, []).length,
    });
  });

  // ==========================================
  // CMS CONTENT API
  // ==========================================
  app.get('/api/cms', (_req, res) => {
    const cms = readJson(CMS_FILE, null);
    res.json(cms);
  });

  app.put('/api/cms', (req, res) => {
    const current = readJson(CMS_FILE, {}) || {};
    const updated = {
      ...current,
      ...req.body,
      lastSyncedAt: new Date().toISOString(),
    };
    writeJson(CMS_FILE, updated);
    res.json({ success: true, cms: updated });
  });

  // ==========================================
  // PRODUCTS API
  // ==========================================
  app.get('/api/products', (_req, res) => {
    const products = readJson(PRODUCTS_FILE, []);
    res.json(products);
  });

  app.put('/api/products', (req, res) => {
    const products = Array.isArray(req.body) ? req.body : [];
    writeJson(PRODUCTS_FILE, products);
    res.json({ success: true, count: products.length });
  });

  app.post('/api/products/item', (req, res) => {
    const products = readJson(PRODUCTS_FILE, []);
    const newProduct = {
      ...req.body,
      id: req.body.id || `prod-${Date.now()}`,
    };
    products.unshift(newProduct);
    writeJson(PRODUCTS_FILE, products);
    res.status(201).json({ success: true, product: newProduct });
  });

  app.put('/api/products/item/:id', (req, res) => {
    const { id } = req.params;
    const products = readJson(PRODUCTS_FILE, []);
    const idx = products.findIndex((p: any) => p.id === id);
    if (idx === -1) {
      const newP = { ...req.body, id };
      products.unshift(newP);
      writeJson(PRODUCTS_FILE, products);
      return res.json({ success: true, product: newP });
    }
    products[idx] = { ...products[idx], ...req.body };
    writeJson(PRODUCTS_FILE, products);
    res.json({ success: true, product: products[idx] });
  });

  app.delete('/api/products/item/:id', (req, res) => {
    const { id } = req.params;
    let products = readJson(PRODUCTS_FILE, []);
    products = products.filter((p: any) => p.id !== id);
    writeJson(PRODUCTS_FILE, products);
    res.json({ success: true, message: 'Product deleted' });
  });

  // ==========================================
  // AWARDS & VIDEOS API
  // ==========================================
  app.get('/api/awards', (_req, res) => {
    const awards = readJson(AWARDS_FILE, []);
    res.json(awards);
  });

  app.put('/api/awards', (req, res) => {
    const awards = Array.isArray(req.body) ? req.body : [];
    writeJson(AWARDS_FILE, awards);
    res.json({ success: true, count: awards.length });
  });

  app.post('/api/awards/item', (req, res) => {
    const awards = readJson(AWARDS_FILE, []);
    const newAward = {
      ...req.body,
      id: req.body.id || `award-${Date.now()}`,
    };
    awards.unshift(newAward);
    writeJson(AWARDS_FILE, awards);
    res.status(201).json({ success: true, award: newAward });
  });

  app.delete('/api/awards/item/:id', (req, res) => {
    const { id } = req.params;
    let awards = readJson(AWARDS_FILE, []);
    awards = awards.filter((a: any) => a.id !== id);
    writeJson(AWARDS_FILE, awards);
    res.json({ success: true, message: 'Award deleted' });
  });

  // ==========================================
  // MLM MEMBERS API
  // ==========================================
  app.get('/api/members', (_req, res) => {
    const members = readJson(MEMBERS_FILE, []);
    res.json(members);
  });

  app.put('/api/members', (req, res) => {
    const members = Array.isArray(req.body) ? req.body : [];
    writeJson(MEMBERS_FILE, members);
    res.json({ success: true, count: members.length });
  });

  app.post('/api/members/item', (req, res) => {
    const members = readJson(MEMBERS_FILE, []);
    const newMember = {
      ...req.body,
      id: req.body.id || `mem-${Date.now()}`,
    };
    members.unshift(newMember);
    writeJson(MEMBERS_FILE, members);
    res.status(201).json({ success: true, member: newMember });
  });

  app.put('/api/members/item/:id', (req, res) => {
    const { id } = req.params;
    const members = readJson(MEMBERS_FILE, []);
    const idx = members.findIndex((m: any) => m.id === id);
    if (idx === -1) {
      const newM = { ...req.body, id };
      members.unshift(newM);
      writeJson(MEMBERS_FILE, members);
      return res.json({ success: true, member: newM });
    }
    members[idx] = { ...members[idx], ...req.body };
    writeJson(MEMBERS_FILE, members);
    res.json({ success: true, member: members[idx] });
  });

  app.delete('/api/members/item/:id', (req, res) => {
    const { id } = req.params;
    let members = readJson(MEMBERS_FILE, []);
    members = members.filter((m: any) => m.id !== id);
    writeJson(MEMBERS_FILE, members);
    res.json({ success: true, message: 'Member deleted successfully' });
  });

  // ==========================================
  // FORM CONFIGS API (MLM & BOOKING)
  // ==========================================
  app.get('/api/form-configs', (_req, res) => {
    const configs = readJson(FORM_CONFIGS_FILE, null);
    res.json(configs);
  });

  app.put('/api/form-configs', (req, res) => {
    const current = readJson(FORM_CONFIGS_FILE, {}) || {};
    const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
    writeJson(FORM_CONFIGS_FILE, updated);
    res.json({ success: true, configs: updated });
  });

  // ==========================================
  // GLOBAL CONFIG API (Active Spreadsheet ID)
  // ==========================================
  app.get('/api/config', (_req, res) => {
    const cfg = readJson(CONFIG_FILE, { activeSheetId: '' });
    res.json(cfg);
  });

  app.put('/api/config', (req, res) => {
    const current = readJson(CONFIG_FILE, { activeSheetId: '' });
    const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
    writeJson(CONFIG_FILE, updated);
    res.json({ success: true, config: updated });
  });

  // ==========================================
  // PUBLISH ALL LOCAL DATA TO CLOUD / SERVER
  // ==========================================
  app.post('/api/publish-all', (req, res) => {
    const { cms, products, awards, members, formConfigs, config } = req.body;
    let modifiedCount = 0;

    if (cms) {
      writeJson(CMS_FILE, cms);
      modifiedCount++;
    }
    if (Array.isArray(products)) {
      writeJson(PRODUCTS_FILE, products);
      modifiedCount += products.length;
    }
    if (Array.isArray(awards)) {
      writeJson(AWARDS_FILE, awards);
      modifiedCount += awards.length;
    }
    if (Array.isArray(members)) {
      writeJson(MEMBERS_FILE, members);
      modifiedCount += members.length;
    }
    if (formConfigs) {
      writeJson(FORM_CONFIGS_FILE, formConfigs);
      modifiedCount++;
    }
    if (config) {
      writeJson(CONFIG_FILE, config);
      modifiedCount++;
    }

    res.json({
      success: true,
      message: 'All platform content committed to server files successfully',
      modifiedCount,
      timestamp: new Date().toISOString(),
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
