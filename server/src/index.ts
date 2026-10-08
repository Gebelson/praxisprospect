import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database.js';

// Route imports
import { dashboardRouter } from './routes/dashboardRouter.js';
import { prospectingRouter } from './routes/prospectingRouter.js';
import { leadsRouter } from './routes/leadsRouter.js';
import { clientsRouter } from './routes/clientsRouter.js';
import { quotesRouter } from './routes/quotesRouter.js';
import { proposalsRouter } from './routes/proposalsRouter.js';
import { projectsRouter } from './routes/projectsRouter.js';
import { briefingsRouter } from './routes/briefingsRouter.js';
import { sitesRouter } from './routes/sitesRouter.js';
import { promptsRouter } from './routes/promptsRouter.js';
import { automationsRouter } from './routes/automationsRouter.js';
import { messagesRouter } from './routes/messagesRouter.js';
import { financialRouter } from './routes/financialRouter.js';
import { notificationsRouter } from './routes/notificationsRouter.js';
import { settingsRouter } from './routes/settingsRouter.js';
import { portalRouter } from './routes/portalRouter.js';
import { agentRouter } from './routes/agentRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Initialize Database & Seeds
initDatabase();

// API Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/prospecting', prospectingRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/briefings', briefingsRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/automations', automationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/financial', financialRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/portal', portalRouter);
app.use('/api/agent', agentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'PRAXIS Platform',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Static frontend serving if built (production mode or unified server)
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  PRAXIS Backend Engine rodando na porta ${PORT}`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`  Uploads:  http://localhost:${PORT}/uploads`);
  if (fs.existsSync(distDir)) {
    console.log(`  Frontend: http://localhost:${PORT}`);
  }
  console.log(`====================================================`);
});
