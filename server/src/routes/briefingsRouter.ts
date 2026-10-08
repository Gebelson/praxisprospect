import { Router } from 'express';
import crypto from 'crypto';
import { 
  PRODUCTION_BRIEFING_STEPS, 
  PRODUCTION_BRIEFING_QUESTIONS, 
  COMMERCIAL_BRIEFING_QUESTIONS 
} from '../services/briefingService.js';
import { query, get, run } from '../db/database.js';
import { dispatchAutomationEvent } from '../services/automationEngine.js';

export const briefingsRouter = Router();

briefingsRouter.get('/templates', (req, res) => {
  res.json({
    productionSteps: PRODUCTION_BRIEFING_STEPS,
    productionQuestions: PRODUCTION_BRIEFING_QUESTIONS,
    commercialQuestions: COMMERCIAL_BRIEFING_QUESTIONS,
  });
});

briefingsRouter.get('/', (req, res) => {
  try {
    const briefings = query(`
      SELECT 
        b.*,
        c.client_code, comp.name as company_name, p.name as project_name
      FROM briefings b
      JOIN clients c ON b.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN projects p ON b.project_id = p.id
      ORDER BY b.created_at DESC
    `);
    res.json(briefings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

briefingsRouter.get('/:id', (req, res) => {
  try {
    const briefing = get('SELECT * FROM briefings WHERE id = ?', [req.params.id]);
    if (!briefing) {
      return res.status(404).json({ error: 'Briefing não encontrado.' });
    }

    res.json({
      briefing,
      answers: JSON.parse(briefing.answers_json || '{}'),
      steps: briefing.type === 'commercial' ? [{ step: 1, title: 'Diagnóstico Comercial', description: '' }] : PRODUCTION_BRIEFING_STEPS,
      questions: briefing.type === 'commercial' ? COMMERCIAL_BRIEFING_QUESTIONS : PRODUCTION_BRIEFING_QUESTIONS,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

briefingsRouter.post('/', (req, res) => {
  try {
    const { clientId, projectId, type } = req.body;
    if (!clientId) {
      return res.status(400).json({ error: 'Cliente é obrigatório.' });
    }

    const briefingId = `brf_${crypto.randomBytes(6).toString('hex')}`;
    const briefingType = type === 'commercial' ? 'commercial' : 'production';

    run(
      `INSERT INTO briefings (id, client_id, project_id, type, status, progress_percent, answers_json, created_at)
       VALUES (?, ?, ?, ?, 'draft', 0, '{}', CURRENT_TIMESTAMP)`,
      [briefingId, clientId, projectId || null, briefingType]
    );

    res.json({ success: true, briefingId, message: 'Briefing criado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

briefingsRouter.put('/:id/answers', async (req, res) => {
  try {
    const { answers, isSubmitted } = req.body;
    const briefing = get('SELECT * FROM briefings WHERE id = ?', [req.params.id]);
    if (!briefing) {
      return res.status(404).json({ error: 'Briefing não encontrado.' });
    }

    const questions = briefing.type === 'commercial' ? COMMERCIAL_BRIEFING_QUESTIONS : PRODUCTION_BRIEFING_QUESTIONS;
    const totalRequired = questions.filter(q => q.isRequired).length;
    const answeredRequired = questions.filter(q => q.isRequired && answers[q.id] && answers[q.id].trim().length > 0).length;
    const progressPercent = totalRequired > 0 ? Math.round((answeredRequired / totalRequired) * 100) : 100;

    const newStatus = isSubmitted ? 'completed' : 'in_progress';
    const submittedAt = isSubmitted ? new Date().toISOString() : briefing.submitted_at;

    run(
      `UPDATE briefings 
       SET answers_json = ?, progress_percent = ?, status = ?, submitted_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [JSON.stringify(answers), progressPercent, newStatus, submittedAt, req.params.id]
    );

    if (isSubmitted) {
      await dispatchAutomationEvent({
        event: 'BRIEFING_COMPLETED',
        payload: {
          briefingId: req.params.id,
          clientId: briefing.client_id,
          projectId: briefing.project_id,
          type: briefing.type,
          answers,
        },
      });
    }

    res.json({
      success: true,
      progressPercent,
      status: newStatus,
      message: isSubmitted ? 'Briefing finalizado com sucesso!' : 'Respostas salvas.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
