import { Router } from 'express';
import { query, run } from '../db/database.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', (req, res) => {
  try {
    const notifications = query('SELECT * FROM notifications ORDER BY is_read ASC, created_at DESC LIMIT 50');
    const unreadCount = Number(query('SELECT count(*) as c FROM notifications WHERE is_read = 0')[0]?.c || 0);
    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

notificationsRouter.patch('/:id/read', (req, res) => {
  try {
    run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

notificationsRouter.post('/mark-all-read', (req, res) => {
  try {
    run('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
