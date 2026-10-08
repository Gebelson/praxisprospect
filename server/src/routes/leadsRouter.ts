import { Router } from 'express';
import crypto from 'crypto';
import { query, get, run, transaction } from '../db/database.js';

export const leadsRouter = Router();

leadsRouter.get('/', (req, res) => {
  try {
    const leads = query(`
      SELECT 
        l.id, l.company_id, l.stage_id, l.niche, l.source, l.score, l.score_priority, l.potential_value, l.notes, l.created_at,
        c.name as company_name, c.city, c.state, c.phone, c.email, c.website, c.instagram,
        s.name as stage_name, s.code as stage_code, s.color as stage_color
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      JOIN crm_stages s ON l.stage_id = s.id
      ORDER BY l.score DESC, l.created_at DESC
    `);
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

leadsRouter.get('/:id', (req, res) => {
  try {
    const lead = get(`
      SELECT 
        l.*,
        c.name as company_name, c.trade_name, c.cnpj, c.city, c.state, c.address, c.phone, c.email, c.website, c.instagram,
        s.name as stage_name, s.code as stage_code, s.color as stage_color
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      JOIN crm_stages s ON l.stage_id = s.id
      WHERE l.id = ?
    `, [req.params.id]);

    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    const scoreRecord = get('SELECT * FROM lead_scores WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.id]);
    const research = get('SELECT * FROM lead_research WHERE lead_id = ? ORDER BY researched_at DESC LIMIT 1', [req.params.id]);
    const activities = query('SELECT * FROM crm_activities WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);
    const followups = query('SELECT * FROM followups WHERE lead_id = ? ORDER BY scheduled_for ASC', [req.params.id]);
    const websiteDemo = get('SELECT * FROM websites WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.id]);

    res.json({
      lead,
      score: scoreRecord ? {
        ...scoreRecord,
        criteria: JSON.parse(scoreRecord.score_breakdown_json || '[]'),
      } : null,
      research,
      activities,
      followups,
      websiteDemo,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

leadsRouter.patch('/:id/stage', (req, res) => {
  try {
    const { stageId } = req.body;
    const stage = get('SELECT * FROM crm_stages WHERE id = ?', [stageId]);
    if (!stage) {
      return res.status(400).json({ error: 'Etapa inválida.' });
    }

    run(
      'UPDATE leads SET stage_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [stageId, req.params.id]
    );

    // Record activity
    run(
      `INSERT INTO crm_activities (id, lead_id, activity_type, title, description, created_at)
       VALUES (?, ?, 'stage_change', 'Etapa do Funil Atualizada', ?, CURRENT_TIMESTAMP)`,
      [`act_${crypto.randomBytes(6).toString('hex')}`, req.params.id, `Movido para a etapa "${stage.name}".`]
    );

    res.json({ success: true, message: `Lead movido para ${stage.name}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

leadsRouter.post('/:id/activity', (req, res) => {
  try {
    const { activityType, title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Título da atividade é obrigatório.' });
    }

    const id = `act_${crypto.randomBytes(6).toString('hex')}`;
    run(
      `INSERT INTO crm_activities (id, lead_id, activity_type, title, description, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, req.params.id, activityType || 'note', title, description || null]
    );

    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

leadsRouter.post('/:id/followup', (req, res) => {
  try {
    const { scheduledFor, channel, messageDraft, notes } = req.body;
    if (!scheduledFor) {
      return res.status(400).json({ error: 'Data/hora de agendamento é obrigatória.' });
    }

    const id = `fup_${crypto.randomBytes(6).toString('hex')}`;
    run(
      `INSERT INTO followups (id, lead_id, scheduled_for, channel, message_draft, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [id, req.params.id, scheduledFor, channel || 'whatsapp', messageDraft || null, notes || null]
    );

    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

leadsRouter.post('/:id/convert', (req, res) => {
  try {
    const lead = get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    // Check if client already exists
    const existingClient = get('SELECT * FROM clients WHERE company_id = ?', [lead.company_id]);
    if (existingClient) {
      return res.json({
        success: true,
        clientId: existingClient.id,
        portalToken: existingClient.portal_token,
        message: 'Empresa já convertida em cliente anteriormente.',
      });
    }

    const clientId = `cli_${crypto.randomBytes(6).toString('hex')}`;
    const clientCode = `CLI-${Math.floor(1000 + Math.random() * 9000)}`;
    const portalToken = `portal_${crypto.randomBytes(16).toString('hex')}`;

    // Target won stage
    const wonStage = get("SELECT id FROM crm_stages WHERE code = 'closed_won'") ||
      get("SELECT id FROM crm_stages WHERE is_won = 1");

    transaction(() => {
      // 1. Insert Client with secure token
      run(
        `INSERT INTO clients (id, company_id, lead_id, client_code, portal_token, status, total_contracted, created_at)
         VALUES (?, ?, ?, ?, ?, 'active', 0, CURRENT_TIMESTAMP)`,
        [clientId, lead.company_id, lead.id, clientCode, portalToken]
      );

      // 2. Update Lead Stage to Won
      if (wonStage) {
        run('UPDATE leads SET stage_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [wonStage.id, lead.id]);
      }

      // 3. Log Activity
      run(
        `INSERT INTO crm_activities (id, lead_id, client_id, activity_type, title, description, created_at)
         VALUES (?, ?, ?, 'conversion', 'Lead Convertido em Cliente', ?, CURRENT_TIMESTAMP)`,
        [
          `act_${crypto.randomBytes(6).toString('hex')}`,
          lead.id,
          clientId,
          `Lead convertido com sucesso! Código: ${clientCode}. Token de acesso ao Portal do Cliente gerado.`,
        ]
      );
    });

    res.json({
      success: true,
      clientId,
      clientCode,
      portalToken,
      portalUrl: `/portal/${portalToken}`,
      message: 'Lead convertido em Cliente com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public Inquiry endpoint for Agency Landing Page ("VAMOS conversar")
leadsRouter.post('/public-inquiry', (req, res) => {
  try {
    const { name, email, phone, projectType, budgetRange, message, replyPreference } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const companyId = `comp_${crypto.randomBytes(6).toString('hex')}`;
    const leadId = `lead_${crypto.randomBytes(6).toString('hex')}`;

    // Default stage (descoberto / primeiro contato)
    const initialStage = get("SELECT id FROM crm_stages WHERE code = 'discovered' OR is_default = 1") ||
      get("SELECT id FROM crm_stages ORDER BY order_index ASC LIMIT 1");

    transaction(() => {
      // 1. Create company / prospect
      run(
        `INSERT INTO companies (id, name, trade_name, email, phone, source, created_at)
         VALUES (?, ?, ?, ?, ?, 'website_inquiry', CURRENT_TIMESTAMP)`,
        [companyId, name, name, email, phone || null]
      );

      // 2. Create lead
      const notes = [
        `Tipo de Projeto: ${projectType || 'Não especificado'}`,
        `Faixa de Orçamento: ${budgetRange || 'A combinar'}`,
        `Preferência de Resposta: ${replyPreference || 'WhatsApp/Email'}`,
        message ? `Mensagem: ${message}` : '',
      ].filter(Boolean).join('\n');

      run(
        `INSERT INTO leads (id, company_id, stage_id, niche, source, score, score_priority, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'landing_page_inquiry', 85, 'high', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [leadId, companyId, initialStage?.id || 'stage_discovered', projectType || 'Desenvolvimento Web', notes]
      );

      // 3. Log CRM Activity
      run(
        `INSERT INTO crm_activities (id, lead_id, activity_type, title, description, created_at)
         VALUES (?, ?, 'form_submission', 'Solicitação de Orçamento pelo Site', ?, CURRENT_TIMESTAMP)`,
        [
          `act_${crypto.randomBytes(6).toString('hex')}`,
          leadId,
          `Lead interessado em "${projectType}". Orçamento: ${budgetRange}. Preferência: ${replyPreference}.`,
        ]
      );

      // 4. Create Notification for the agency operator
      run(
        `INSERT INTO notifications (id, title, message, type, entity_type, entity_id, is_read, created_at)
         VALUES (?, ?, ?, 'lead_captured', 'lead', ?, 0, CURRENT_TIMESTAMP)`,
        [
          `notif_${crypto.randomBytes(6).toString('hex')}`,
          '⚡ Novo Lead pelo Site!',
          `${name} solicitou orçamento para ${projectType || 'Site'} (${budgetRange || 'Valor sob consulta'}).`,
          leadId,
        ]
      );
    });

    res.json({
      success: true,
      leadId,
      message: 'Solicitação recebida com sucesso! Nossa equipe entrará em contato em breve.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
