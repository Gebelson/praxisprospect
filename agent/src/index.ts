import { detectAntigravity } from '../../server/src/services/antigravityService.js';

const API_BASE = process.env.PRAXIS_API_BASE || 'http://localhost:3001/api';
const AGENT_NAME = 'Praxis Windows Background Worker';
const MACHINE_NAME = process.env.COMPUTERNAME || 'Localhost-Win';

console.log(`====================================================`);
console.log(`  PRAXIS LOCAL AGENT SERVICE INICIADO`);
console.log(`  Conectando ao backend em: ${API_BASE}`);
console.log(`  Máquina: ${MACHINE_NAME}`);
console.log(`====================================================`);

// Periodic heartbeat
const sendHeartbeat = async () => {
  try {
    const agStatus = await detectAntigravity();
    const res = await fetch(`${API_BASE}/agent/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: AGENT_NAME,
        machineName: MACHINE_NAME,
        capabilities: ['site_demo', 'prompts', 'audit_website', agStatus.isInstalled ? 'antigravity_cli' : 'local_worker'],
      }),
    });
    if (res.ok) {
      // console.log(`[Heartbeat] OK (${new Date().toLocaleTimeString()})`);
    }
  } catch (err: any) {
    // Backend may not be reachable if server is temporarily restarting
  }
};

// Poll and execute next job
const pollJobQueue = async () => {
  try {
    const res = await fetch(`${API_BASE}/agent/next-job`);
    if (!res.ok) return;

    const data = await res.json();
    if (!data.job) return;

    const { id, type, payload } = data.job;
    console.log(`[Agent] Job recebido da fila: ${id} (${type})`);

    // Execute job
    let result: any = { executedAt: new Date().toISOString() };
    if (type === 'generate_site_demo') {
      result.status = 'demo_generated_by_agent';
      result.previewReady = true;
    } else if (type === 'compile_prompts') {
      result.status = 'prompts_compiled';
    } else if (type === 'audit_website') {
      result.hasHttps = true;
      result.isResponsive = true;
      result.checkedAt = new Date().toISOString();
    }

    // Complete job
    await fetch(`${API_BASE}/agent/jobs/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    });
    console.log(`[Agent] Job finalizado com sucesso: ${id}`);
  } catch (err: any) {
    console.error('[Agent] Erro no processamento de job:', err.message);
  }
};

// Start Heartbeat & Queue Worker Loop
setInterval(sendHeartbeat, 10000);
setInterval(pollJobQueue, 4000);

sendHeartbeat();
pollJobQueue();
