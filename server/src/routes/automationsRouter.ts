import { Router } from 'express';
import crypto from 'crypto';
import { query, get, run } from '../db/database.js';

export const automationsRouter = Router();

automationsRouter.get('/', (req, res) => {
  try {
    const automations = query('SELECT * FROM automations ORDER BY created_at DESC');
    res.json(automations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

automationsRouter.post('/', (req, res) => {
  try {
    const { name, triggerEvent, conditions, actions } = req.body;
    if (!name || !triggerEvent || !actions) {
      return res.status(400).json({ error: 'Nome, gatilho e ações são obrigatórios.' });
    }

    const id = `auto_${crypto.randomBytes(6).toString('hex')}`;
    run(
      `INSERT INTO automations (id, name, trigger_event, conditions_json, actions_json, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [id, name, triggerEvent, JSON.stringify(conditions || []), JSON.stringify(actions)]
    );

    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

automationsRouter.patch('/:id/toggle', (req, res) => {
  try {
    const auto = get('SELECT is_active FROM automations WHERE id = ?', [req.params.id]);
    if (!auto) {
      return res.status(404).json({ error: 'Automação não encontrada.' });
    }

    const newStatus = auto.is_active === 1 ? 0 : 1;
    run('UPDATE automations SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);

    res.json({ success: true, isActive: newStatus === 1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

automationsRouter.get('/runs', (req, res) => {
  try {
    const runs = query(`
      SELECT r.*, a.name as automation_name
      FROM automation_runs r
      JOIN automations a ON r.automation_id = a.id
      ORDER BY r.executed_at DESC
      LIMIT 30
    `);
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
