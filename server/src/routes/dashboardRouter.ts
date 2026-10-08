import { Router } from 'express';
import { query, get } from '../db/database.js';
import { getFinancialSummary } from '../services/financialService.js';

export const dashboardRouter = Router();

dashboardRouter.get('/metrics', (req, res) => {
  try {
    const totalLeads = Number(get('SELECT count(*) as c FROM leads')?.c || 0);
    const qualifiedLeads = Number(get("SELECT count(*) as c FROM leads WHERE score >= 65")?.c || 0);
    const contactedLeads = Number(get(`
      SELECT count(DISTINCT l.id) as c 
      FROM leads l 
      JOIN crm_stages s ON l.stage_id = s.id 
      WHERE s.code IN ('contacted', 'replied', 'interested', 'briefing_sent', 'briefing_received', 'proposal_sent', 'negotiating', 'closed_won')
    `)?.c || 0);
    const wonLeads = Number(get(`
      SELECT count(*) as c 
      FROM leads l 
      JOIN crm_stages s ON l.stage_id = s.id 
      WHERE s.is_won = 1
    `)?.c || 0);

    const activeProjects = Number(get("SELECT count(*) as c FROM projects WHERE status IN ('planning', 'in_progress', 'review')")?.c || 0);
    const delayedProjects = Number(get("SELECT count(*) as c FROM projects WHERE status = 'delayed'")?.c || 0);
    const completedProjects = Number(get("SELECT count(*) as c FROM projects WHERE status = 'completed'")?.c || 0);

    const proposalsSent = Number(get("SELECT count(*) as c FROM proposals WHERE status = 'sent'")?.c || 0);
    const proposalsAccepted = Number(get("SELECT count(*) as c FROM proposals WHERE status = 'accepted'")?.c || 0);

    const financial = getFinancialSummary();

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    res.json({
      leadsFound: totalLeads,
      leadsQualified: qualifiedLeads,
      leadsContacted: contactedLeads,
      salesWon: wonLeads,
      activeProjects,
      delayedProjects,
      completedProjects,
      proposalsSent,
      proposalsAccepted,
      contractedRevenue: financial.totalContracted,
      receivedRevenue: financial.totalReceived,
      pendingRevenue: financial.totalPending,
      averageTicket: financial.averageTicket,
      conversionRate,
      mrr: financial.recurringMonthlyRevenue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dashboardRouter.get('/funnel', (req, res) => {
  try {
    const stages = query(`
      SELECT s.id, s.name, s.code, s.order_index, s.color, COUNT(l.id) as count
      FROM crm_stages s
      LEFT JOIN leads l ON l.stage_id = s.id
      GROUP BY s.id
      ORDER BY s.order_index ASC
    `);
    res.json(stages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dashboardRouter.get('/recent-activity', (req, res) => {
  try {
    const activities = query(`
      SELECT a.*, l.niche, c.name as company_name
      FROM crm_activities a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN companies c ON l.company_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 15
    `);
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
