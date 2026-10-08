import { Router } from 'express';
import crypto from 'crypto';
import { renderTemplateText, prepareChannelLinks } from '../services/messagingService.js';
import { query, get, run } from '../db/database.js';

export const messagesRouter = Router();

messagesRouter.get('/templates', (req, res) => {
  try {
    const templates = query('SELECT * FROM message_templates ORDER BY created_at ASC');
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRouter.post('/render', (req, res) => {
  try {
    const { templateId, templateText, variables, phone, email, instagram, subject } = req.body;

    let rawText = templateText;
    if (templateId && !rawText) {
      const tpl = get('SELECT template_text, subject FROM message_templates WHERE id = ?', [templateId]);
      if (tpl) {
        rawText = tpl.template_text;
      }
    }

    if (!rawText) {
      return res.status(400).json({ error: 'Texto do modelo não fornecido.' });
    }

    const rendered = renderTemplateText(rawText, variables || {});
    const channelLinks = prepareChannelLinks(rendered, subject, phone, email, instagram);

    res.json({
      success: true,
      renderedText: rendered,
      whatsappUrl: channelLinks.whatsappUrl,
      instagramUrl: channelLinks.instagramUrl,
      mailtoUrl: channelLinks.mailtoUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRouter.post('/record', (req, res) => {
  try {
    const { leadId, clientId, channel, subject, content, status } = req.body;
    if (!content || !channel) {
      return res.status(400).json({ error: 'Conteúdo e canal são obrigatórios.' });
    }

    const id = `msg_${crypto.randomBytes(6).toString('hex')}`;
    run(
      `INSERT INTO messages (id, lead_id, client_id, channel, subject, content, status, sent_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, leadId || null, clientId || null, channel, subject || null, content, status || 'sent']
    );

    // Also record activity if linked to lead
    if (leadId) {
      run(
        `INSERT INTO crm_activities (id, lead_id, activity_type, title, description, created_at)
         VALUES (?, ?, 'outreach_message', ?, ?, CURRENT_TIMESTAMP)`,
        [
          `act_${crypto.randomBytes(6).toString('hex')}`,
          leadId,
          `Mensagem enviada via ${channel.toUpperCase()}`,
          content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        ]
      );
    }

    res.json({ success: true, messageId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRouter.get('/history', (req, res) => {
  try {
    const history = query(`
      SELECT m.*, c.name as company_name
      FROM messages m
      LEFT JOIN leads l ON m.lead_id = l.id
      LEFT JOIN companies c ON l.company_id = c.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
