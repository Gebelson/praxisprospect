import { db, run, query, get } from '../db/database.js';
import crypto from 'crypto';

export interface JobRecord {
  id: string;
  job_type: string;
  payload_json: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
  priority: number;
  attempts: number;
  max_attempts: number;
  result_json?: string;
  error_message?: string;
  scheduled_for?: string;
  locked_at?: string;
  completed_at?: string;
  created_at: string;
}

export const enqueueJob = (
  jobType: string,
  payload: Record<string, any>,
  priority: number = 10
): string => {
  const id = `job_${crypto.randomBytes(8).toString('hex')}`;
  run(
    `INSERT INTO jobs (id, job_type, payload_json, status, priority, attempts, max_attempts, created_at)
     VALUES (?, ?, ?, 'pending', ?, 0, 3, CURRENT_TIMESTAMP)`,
    [id, jobType, JSON.stringify(payload), priority]
  );
  console.log(`[Queue] Job criado: ${id} (${jobType}) [Prioridade: ${priority}]`);
  return id;
};

export const fetchNextJob = (): JobRecord | undefined => {
  // Grab highest priority pending job that hasn't exceeded attempts
  const job = get<JobRecord>(
    `SELECT * FROM jobs 
     WHERE status = 'pending' AND attempts < max_attempts 
     ORDER BY priority DESC, created_at ASC 
     LIMIT 1`
  );

  if (!job) return undefined;

  // Lock job
  run(
    `UPDATE jobs 
     SET status = 'running', locked_at = CURRENT_TIMESTAMP, attempts = attempts + 1 
     WHERE id = ?`,
    [job.id]
  );

  // Record attempt
  run(
    `INSERT INTO job_attempts (id, job_id, attempt_number, started_at) 
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [`att_${crypto.randomBytes(6).toString('hex')}`, job.id, job.attempts + 1]
  );

  return {
    ...job,
    status: 'running',
    attempts: job.attempts + 1,
  };
};

export const completeJob = (jobId: string, result: Record<string, any>) => {
  run(
    `UPDATE jobs 
     SET status = 'completed', result_json = ?, completed_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [JSON.stringify(result), jobId]
  );
  console.log(`[Queue] Job concluído com sucesso: ${jobId}`);
};

export const failJob = (jobId: string, errorMessage: string) => {
  const job = get<JobRecord>('SELECT * FROM jobs WHERE id = ?', [jobId]);
  if (!job) return;
  const newAttempts = job.attempts + 1;
  const newStatus = newAttempts >= job.max_attempts ? 'failed' : 'pending';
  
  run(
    `UPDATE jobs 
     SET status = ?, error_message = ?, attempts = ? 
     WHERE id = ?`,
    [newStatus, errorMessage, newAttempts, jobId]
  );
  console.warn(`[Queue] Falha no Job ${jobId}: ${errorMessage} (Novo status: ${newStatus}, Tentativas: ${newAttempts})`);
};

export const recordAgentHeartbeat = (agentName: string, machineName: string, capabilities: string[]) => {
  const existing = get('SELECT id FROM local_agents WHERE agent_name = ?', [agentName]);
  if (existing) {
    run(
      `UPDATE local_agents 
       SET status = 'online', last_heartbeat_at = CURRENT_TIMESTAMP, capabilities_json = ? 
       WHERE agent_name = ?`,
      [JSON.stringify(capabilities), agentName]
    );
  } else {
    run(
      `INSERT INTO local_agents (id, agent_name, machine_name, status, capabilities_json, created_at) 
       VALUES (?, ?, ?, 'online', ?, CURRENT_TIMESTAMP)`,
      [`agent_${crypto.randomBytes(6).toString('hex')}`, agentName, machineName, JSON.stringify(capabilities)]
    );
  }
};
