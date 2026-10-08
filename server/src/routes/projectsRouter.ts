import { Router } from 'express';
import crypto from 'crypto';
import { query, get, run, transaction } from '../db/database.js';

export const projectsRouter = Router();

const DEFAULT_PROJECT_STAGES = [
  { name: 'Briefing & Alinhamento', code: 'briefing', weight: 5 },
  { name: 'Proposta & Contratação', code: 'proposal', weight: 5 },
  { name: 'Recebimento de Materiais', code: 'materials', weight: 10 },
  { name: 'Planejamento & Arquitetura', code: 'planning', weight: 5 },
  { name: 'Wireframe & Estrutura', code: 'wireframe', weight: 5 },
  { name: 'Identidade & Design System', code: 'design', weight: 10 },
  { name: 'Desenvolvimento Front-end', code: 'development', weight: 20 },
  { name: 'Integrações & Formulários', code: 'integrations', weight: 10 },
  { name: 'Testes de Performance & SEO', code: 'testing', weight: 5 },
  { name: 'Homologação Interna', code: 'internal_qa', weight: 5 },
  { name: 'Revisão do Cliente', code: 'client_review', weight: 5 },
  { name: 'Correções & Refinamentos', code: 'adjustments', weight: 5 },
  { name: 'Publicação no Domínio Oficial', code: 'deployment', weight: 5 },
  { name: 'Entrega Final & Encerramento', code: 'handover', weight: 5 },
];

projectsRouter.get('/', (req, res) => {
  try {
    const projects = query(`
      SELECT 
        p.*,
        c.client_code, comp.name as company_name, comp.city,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as completed_tasks
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      ORDER BY p.created_at DESC
    `);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectsRouter.get('/:id', (req, res) => {
  try {
    const project = get(`
      SELECT 
        p.*,
        c.client_code, c.portal_token, comp.name as company_name, comp.city, comp.phone
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    const stages = query('SELECT * FROM project_stages WHERE project_id = ? ORDER BY order_index ASC', [req.params.id]);
    const tasks = query('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC', [req.params.id]);
    const revisions = query('SELECT * FROM project_revisions WHERE project_id = ? ORDER BY revision_number DESC', [req.params.id]);
    const materials = query('SELECT * FROM material_requirements WHERE project_id = ? ORDER BY created_at ASC', [req.params.id]);
    const files = query('SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({
      project,
      stages,
      tasks,
      revisions,
      materials,
      files,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectsRouter.post('/', (req, res) => {
  try {
    const { clientId, proposalId, name, projectType, totalValue, targetDeadline } = req.body;
    if (!clientId || !name) {
      return res.status(400).json({ error: 'Cliente e Nome do projeto são obrigatórios.' });
    }

    const projectId = `proj_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      // 1. Create Project
      run(
        `INSERT INTO projects (
          id, client_id, proposal_id, name, project_type, status, current_stage, 
          progress_percent, target_deadline, total_value, created_at
        ) VALUES (?, ?, ?, ?, ?, 'planning', 'Briefing & Alinhamento', 5, ?, ?, CURRENT_TIMESTAMP)`,
        [
          projectId,
          clientId,
          proposalId || null,
          name,
          projectType || 'institucional',
          targetDeadline || null,
          totalValue || 0,
        ]
      );

      // 2. Initialize 14 stages
      DEFAULT_PROJECT_STAGES.forEach((stg, idx) => {
        const stageId = `stage_${crypto.randomBytes(6).toString('hex')}`;
        const initialStatus = idx === 0 ? 'in_progress' : 'pending';
        run(
          `INSERT INTO project_stages (id, project_id, stage_name, stage_code, order_index, status, weight_percent, started_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            stageId,
            projectId,
            stg.name,
            stg.code,
            idx + 1,
            initialStatus,
            stg.weight,
            idx === 0 ? new Date().toISOString() : null,
          ]
        );

        // Add 2 standard tasks per stage
        run(
          `INSERT INTO tasks (id, project_id, stage_id, title, status, estimated_hours, created_at)
           VALUES (?, ?, ?, ?, ?, 3, CURRENT_TIMESTAMP)`,
          [
            `task_${crypto.randomBytes(6).toString('hex')}`,
            projectId,
            stageId,
            `Executar validação de ${stg.name}`,
            initialStatus === 'in_progress' ? 'in_progress' : 'pending',
          ]
        );
      });

      // 3. Update client total contracted
      if (totalValue) {
        run('UPDATE clients SET total_contracted = total_contracted + ? WHERE id = ?', [totalValue, clientId]);
      }
    });

    res.json({ success: true, projectId, message: 'Projeto criado com 14 etapas configuradas!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectsRouter.patch('/:id/tasks/:taskId/toggle', (req, res) => {
  try {
    const task = get('SELECT * FROM tasks WHERE id = ? AND project_id = ?', [req.params.taskId, req.params.id]);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;

    run(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?',
      [newStatus, completedAt, req.params.taskId]
    );

    // Recalculate real project progress based on tasks
    const allTasks = query('SELECT status FROM tasks WHERE project_id = ?', [req.params.id]);
    const total = allTasks.length;
    const completed = allTasks.filter((t: any) => t.status === 'done').length;
    const calculatedProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    run('UPDATE projects SET progress_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [calculatedProgress, req.params.id]);

    res.json({
      success: true,
      taskId: req.params.taskId,
      status: newStatus,
      projectProgress: calculatedProgress,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectsRouter.post('/:id/tasks', (req, res) => {
  try {
    const { title, stageId, priority, estimatedHours } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
    }

    const taskId = `task_${crypto.randomBytes(6).toString('hex')}`;
    run(
      `INSERT INTO tasks (id, project_id, stage_id, title, priority, estimated_hours, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [taskId, req.params.id, stageId || null, title, priority || 'medium', estimatedHours || 2]
    );

    res.json({ success: true, taskId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectsRouter.post('/:id/revisions', (req, res) => {
  try {
    const { requestedBy, sectionRef, description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Descrição do ajuste é obrigatória.' });
    }

    const countRes = get('SELECT count(*) as c FROM project_revisions WHERE project_id = ?', [req.params.id]);
    const nextRevisionNum = Number(countRes?.c || 0) + 1;

    const revId = `rev_${crypto.randomBytes(6).toString('hex')}`;
    run(
      `INSERT INTO project_revisions (id, project_id, revision_number, section_ref, requested_by, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`,
      [revId, req.params.id, nextRevisionNum, sectionRef || null, requestedBy || 'Cliente', description]
    );

    res.json({ success: true, revisionId: revId, revisionNumber: nextRevisionNum });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
