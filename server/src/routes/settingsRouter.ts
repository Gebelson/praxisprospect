import { Router } from 'express';
import { query, get, run } from '../db/database.js';
import { detectAntigravity } from '../services/antigravityService.js';

export const settingsRouter = Router();

settingsRouter.get('/', (req, res) => {
  try {
    const settingsList = query('SELECT * FROM settings');
    const settingsMap: Record<string, any> = {};
    for (const s of settingsList) {
      settingsMap[s.key] = {
        value: JSON.parse(s.value_json),
        category: s.category,
        description: s.description,
        updatedAt: s.updated_at,
      };
    }
    res.json(settingsMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

settingsRouter.put('/:key', (req, res) => {
  try {
    const { value } = req.body;
    run(
      'UPDATE settings SET value_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [JSON.stringify(value), req.params.key]
    );
    res.json({ success: true, key: req.params.key });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

settingsRouter.get('/antigravity-status', async (req, res) => {
  try {
    const status = await detectAntigravity();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

settingsRouter.get('/pricing-rules', (req, res) => {
  try {
    const rules = query('SELECT * FROM pricing_rules ORDER BY category, key');
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

settingsRouter.put('/pricing-rules/:key', (req, res) => {
  try {
    const { valueNumber } = req.body;
    run('UPDATE pricing_rules SET value_number = ? WHERE key = ?', [Number(valueNumber), req.params.key]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

settingsRouter.get('/backup', (req, res) => {
  try {
    const companies = query('SELECT * FROM companies');
    const leads = query('SELECT * FROM leads');
    const clients = query('SELECT * FROM clients');
    const projects = query('SELECT * FROM projects');
    const quotes = query('SELECT * FROM quotes');
    const proposals = query('SELECT * FROM proposals');
    const briefings = query('SELECT * FROM briefings');
    const invoices = query('SELECT * FROM invoices');
    const payments = query('SELECT * FROM payments');

    const backupPayload = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        companies,
        leads,
        clients,
        projects,
        quotes,
        proposals,
        briefings,
        invoices,
        payments,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=praxis_backup_${Date.now()}.json`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
