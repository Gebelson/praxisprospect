import { Router } from 'express';
import { 
  recordAgentHeartbeat, 
  fetchNextJob, 
  completeJob, 
  failJob 
} from '../services/agentQueueService.js';
import { query } from '../db/database.js';

export const agentRouter = Router();

agentRouter.post('/heartbeat', (req, res) => {
  try {
    const { agentName, machineName, capabilities } = req.body;
    recordAgentHeartbeat(
      agentName || 'Praxis Windows Worker',
      machineName || process.env.COMPUTERNAME || 'Localhost',
      capabilities || ['site_demo', 'prompts', 'audit']
    );
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentRouter.get('/status', (req, res) => {
  try {
    const agents = query('SELECT * FROM local_agents ORDER BY last_heartbeat_at DESC');
    const jobsSummary = query(`
      SELECT status, COUNT(*) as count 
      FROM jobs 
      GROUP BY status
    `);
    res.json({ agents, jobsSummary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentRouter.get('/next-job', (req, res) => {
  try {
    const job = fetchNextJob();
    if (!job) {
      return res.json({ job: null, message: 'Nenhuma tarefa pendente na fila.' });
    }
    res.json({
      job: {
        id: job.id,
        type: job.job_type,
        payload: JSON.parse(job.payload_json || '{}'),
        priority: job.priority,
        attempts: job.attempts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentRouter.post('/jobs/:id/complete', (req, res) => {
  try {
    const { result } = req.body;
    completeJob(req.params.id, result || { success: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentRouter.post('/jobs/:id/fail', (req, res) => {
  try {
    const { errorMessage } = req.body;
    failJob(req.params.id, errorMessage || 'Erro desconhecido');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
