import { Router } from 'express';
import crypto from 'crypto';
import { searchOpenStreetMap, DiscoveredLead } from '../services/osmService.js';
import { calculateLeadScore } from '../services/leadScoringService.js';
import { run, get, transaction } from '../db/database.js';
import { dispatchAutomationEvent } from '../services/automationEngine.js';

export const prospectingRouter = Router();

prospectingRouter.post('/search', async (req, res) => {
  try {
    const { city, niche, state, neighborhood, onlyWithoutWebsite } = req.body;
    if (!city || !niche) {
      return res.status(400).json({ error: 'Cidade e Nicho são obrigatórios para prospecção.' });
    }

    const results = await searchOpenStreetMap({
      city,
      niche,
      state,
      neighborhood,
      onlyWithoutWebsite: Boolean(onlyWithoutWebsite),
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

prospectingRouter.post('/import', async (req, res) => {
  try {
    const leadData: DiscoveredLead = req.body;
    if (!leadData.name) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório.' });
    }

    // Check duplicate by name and city
    const existing = get(
      'SELECT id FROM companies WHERE LOWER(name) = LOWER(?) AND LOWER(city) = LOWER(?)',
      [leadData.name, leadData.city]
    );

    if (existing) {
      return res.status(409).json({ error: 'Esta empresa já está cadastrada no sistema.', companyId: existing.id });
    }

    const companyId = `comp_${crypto.randomBytes(6).toString('hex')}`;
    const leadId = `lead_${crypto.randomBytes(6).toString('hex')}`;
    const contactId = `cont_${crypto.randomBytes(6).toString('hex')}`;

    // Get default discovered stage
    const defaultStage = get("SELECT id FROM crm_stages WHERE code = 'discovered'") ||
      get("SELECT id FROM crm_stages ORDER BY order_index ASC LIMIT 1");

    // Compute Lead Score
    const scoreResult = calculateLeadScore({
      hasWebsite: leadData.hasWebsite,
      website: leadData.website,
      phone: leadData.phone,
      email: leadData.email,
      instagram: leadData.instagram,
      niche: leadData.niche,
      companyName: leadData.name,
    });

    transaction(() => {
      // 1. Insert Company
      run(
        `INSERT INTO companies (id, name, segment, niche, city, state, address, phone, email, website, instagram, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          companyId,
          leadData.name,
          leadData.category,
          leadData.niche,
          leadData.city,
          leadData.state || 'SP',
          leadData.address,
          leadData.phone || null,
          leadData.email || null,
          leadData.website || null,
          leadData.instagram || null,
        ]
      );

      // 2. Insert Primary Contact if phone or email
      run(
        `INSERT INTO contacts (id, company_id, name, email, phone, whatsapp, is_primary, consent_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 'commercial_public_directory', CURRENT_TIMESTAMP)`,
        [
          contactId,
          companyId,
          `Comercial ${leadData.name}`,
          leadData.email || null,
          leadData.phone || null,
          leadData.phone || null,
        ]
      );

      // 3. Insert Lead
      run(
        `INSERT INTO leads (id, company_id, stage_id, niche, source, score, score_priority, potential_value, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          leadId,
          companyId,
          defaultStage.id,
          leadData.niche,
          leadData.source || 'OpenStreetMap',
          scoreResult.totalScore,
          scoreResult.priority,
          1800.0, // Initial estimated value
        ]
      );

      // 4. Insert Lead Score Breakdown
      run(
        `INSERT INTO lead_scores (id, lead_id, total_score, priority, score_breakdown_json, explanation, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `score_${crypto.randomBytes(6).toString('hex')}`,
          leadId,
          scoreResult.totalScore,
          scoreResult.priority,
          JSON.stringify(scoreResult.criteriaBreakdown),
          scoreResult.summary,
        ]
      );

      // 5. Insert Lead Research Audit
      run(
        `INSERT INTO lead_research (id, lead_id, has_website, is_responsive, has_https, source_name, verified_facts, researched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `res_${crypto.randomBytes(6).toString('hex')}`,
          leadId,
          leadData.hasWebsite ? 1 : 0,
          0,
          leadData.website?.startsWith('https') ? 1 : 0,
          leadData.source,
          `Empresa verificada via base pública aberta em ${leadData.city}. Dados coletados: telefone ${leadData.phone || 'não informado'}, website ${leadData.website || 'inexistente'}.`,
        ]
      );

      // 6. Log Initial Activity
      run(
        `INSERT INTO crm_activities (id, lead_id, activity_type, title, description, created_at)
         VALUES (?, ?, 'prospecting', 'Lead Importado para o CRM', ?, CURRENT_TIMESTAMP)`,
        [
          `act_${crypto.randomBytes(6).toString('hex')}`,
          leadId,
          `Empresa captada via ${leadData.source}. Score inicial: ${scoreResult.totalScore} pontos (${scoreResult.priority}).`,
        ]
      );
    });

    // Fire Automation Engine Event asynchronously
    dispatchAutomationEvent({
      event: 'LEAD_CREATED',
      payload: {
        leadId,
        companyId,
        score: scoreResult.totalScore,
        priority: scoreResult.priority,
        niche: leadData.niche,
        companyName: leadData.name,
        city: leadData.city,
        phone: leadData.phone,
      },
    }).catch(err => console.error('[Event Error]', err));

    res.json({
      success: true,
      leadId,
      companyId,
      score: scoreResult,
      message: 'Lead importado e qualificado com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
