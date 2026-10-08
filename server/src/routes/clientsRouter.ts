import { Router } from 'express';
import crypto from 'crypto';
import { query, get, run } from '../db/database.js';

export const clientsRouter = Router();

clientsRouter.get('/', (req, res) => {
  try {
    const clients = query(`
      SELECT 
        c.id, c.client_code, c.portal_token, c.status, c.total_contracted, c.created_at,
        comp.name as company_name, comp.trade_name, comp.city, comp.state, comp.phone, comp.email, comp.niche,
        (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) as projects_count,
        (SELECT COUNT(*) FROM briefings b WHERE b.client_id = c.id) as briefings_count
      FROM clients c
      JOIN companies comp ON c.company_id = comp.id
      ORDER BY c.created_at DESC
    `);
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

clientsRouter.get('/:id', (req, res) => {
  try {
    const client = get(`
      SELECT 
        c.*,
        comp.name as company_name, comp.trade_name, comp.cnpj, comp.city, comp.state, comp.address, comp.phone, comp.email, comp.niche
      FROM clients c
      JOIN companies comp ON c.company_id = comp.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const projects = query('SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC', [req.params.id]);
    const briefings = query('SELECT * FROM briefings WHERE client_id = ? ORDER BY created_at DESC', [req.params.id]);
    const proposals = query('SELECT * FROM proposals WHERE client_id = ? ORDER BY created_at DESC', [req.params.id]);
    const invoices = query('SELECT * FROM invoices WHERE client_id = ? ORDER BY due_date DESC', [req.params.id]);
    const files = query('SELECT * FROM files WHERE client_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({
      client,
      projects,
      briefings,
      proposals,
      invoices,
      files,
      portalUrl: `/portal/${client.portal_token}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

clientsRouter.post('/:id/regenerate-token', (req, res) => {
  try {
    const newToken = `portal_${crypto.randomBytes(16).toString('hex')}`;
    run('UPDATE clients SET portal_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newToken, req.params.id]);
    res.json({ success: true, portalToken: newToken, portalUrl: `/portal/${newToken}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
