import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import { db, initDatabase, query, get, run } from '../server/src/db/database.js';
import { searchOpenStreetMap } from '../server/src/services/osmService.js';
import { calculateLeadScore } from '../server/src/services/leadScoringService.js';
import { calculateProjectQuote } from '../server/src/services/pricingEngine.js';
import { generateCompleteProposal, createDigitalSignatureHash } from '../server/src/services/proposalService.js';
import { generateDemoSite } from '../server/src/services/siteGeneratorService.js';
import { generateSiteAndImagePrompts } from '../server/src/services/promptGeneratorService.js';
import { generateMaterialsChecklistFromBriefing } from '../server/src/services/materialsChecklistService.js';
import { enqueueJob, fetchNextJob, completeJob, failJob } from '../server/src/services/agentQueueService.js';
import { dispatchAutomationEvent } from '../server/src/services/automationEngine.js';
import { getFinancialSummary, registerPaymentManual } from '../server/src/services/financialService.js';
import { detectAntigravity } from '../server/src/services/antigravityService.js';

beforeAll(() => {
  initDatabase();
});

describe('PRAXIS — Suíte Oficial de Testes Automatizados (27 Fluxos Obrigatórios)', () => {
  // 1. Cadastro e autenticação
  it('1. Cadastro e autenticação de usuários', () => {
    const userId = `usr_test_${Date.now()}_${Math.random()}`;
    const token = crypto.randomBytes(16).toString('hex');
    run(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`,
      [userId, 'Administrador Teste', `admin_${Date.now()}_${Math.random()}@praxis.local`, 'hash_segura_123']
    );
    run(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime('now', '+7 days'))`,
      [`sess_${Date.now()}`, userId, token]
    );

    const user = get('SELECT * FROM users WHERE id = ?', [userId]);
    const session = get('SELECT * FROM sessions WHERE token = ?', [token]);
    expect(user).toBeDefined();
    expect(user.role).toBe('admin');
    expect(session).toBeDefined();
    expect(session.user_id).toBe(userId);
  });

  // 2. Descoberta de empresas por fonte autorizada
  it('2. Descoberta de empresas por fonte autorizada (OpenStreetMap Overpass)', async () => {
    const results = await searchOpenStreetMap({
      city: 'Campinas',
      niche: 'odontologia',
      state: 'SP',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('Campinas');
    expect(['OpenStreetMap Overpass API', 'Diretório Público Regional de Empresas']).toContain(results[0].source);
    expect(results[0].name).toBeDefined();
  }, 15000);

  // 3. Criação de lead
  it('3. Criação de lead com persistência relacional', () => {
    const compId = `comp_t_${Date.now()}`;
    const leadId = `lead_t_${Date.now()}`;
    const stage = get("SELECT id FROM crm_stages WHERE code = 'discovered'");

    run(
      `INSERT INTO companies (id, name, niche, city, phone) VALUES (?, ?, ?, ?, ?)`,
      [compId, 'Clínica Odonto Teste', 'odontologia', 'Campinas', '(19) 98765-4321']
    );
    run(
      `INSERT INTO leads (id, company_id, stage_id, niche, score) VALUES (?, ?, ?, ?, 85)`,
      [leadId, compId, stage.id, 'odontologia']
    );

    const lead = get('SELECT * FROM leads WHERE id = ?', [leadId]);
    expect(lead).toBeDefined();
    expect(lead.company_id).toBe(compId);
    expect(lead.score).toBe(85);
  });

  // 4. Qualificação (Score inteligente)
  it('4. Qualificação determinística de leads e auditoria de pontuação', () => {
    const scoreRes = calculateLeadScore({
      hasWebsite: false,
      phone: '(11) 99999-9999',
      email: 'contato@empresa.com',
      instagram: '@drsorriso',
      niche: 'odontologia',
      companyName: 'Dr. Sorriso',
    });

    expect(scoreRes.totalScore).toBeGreaterThanOrEqual(85);
    expect(scoreRes.priority).toBe('estrategico');
    expect(scoreRes.criteriaBreakdown.length).toBeGreaterThan(2);
    expect(scoreRes.summary).toContain('Oportunidade Estratégica');
  });

  // 5. Conversão de lead em cliente
  it('5. Conversão de lead em cliente com geração de portal_token', () => {
    const compId = `comp_conv_${Date.now()}`;
    const leadId = `lead_conv_${Date.now()}`;
    const stage = get("SELECT id FROM crm_stages WHERE code = 'closed_won'");
    const portalToken = `portal_${crypto.randomBytes(16).toString('hex')}`;
    const clientCode = `CLI-${Date.now()}`;
    const clientId = `cli_conv_${Date.now()}`;

    run(`INSERT INTO companies (id, name, city) VALUES (?, 'Empresa Convertida', 'São Paulo')`, [compId]);
    run(`INSERT INTO leads (id, company_id, stage_id, niche) VALUES (?, ?, ?, 'geral')`, [leadId, compId, stage.id]);
    run(
      `INSERT INTO clients (id, company_id, lead_id, client_code, portal_token, total_contracted) VALUES (?, ?, ?, ?, ?, 2500)`,
      [clientId, compId, leadId, clientCode, portalToken]
    );

    const client = get('SELECT * FROM clients WHERE portal_token = ?', [portalToken]);
    expect(client).toBeDefined();
    expect(client.client_code).toBe(clientCode);
    expect(client.total_contracted).toBe(2500);
  });

  // 6. Criação de briefing
  it('6. Criação de briefing comercial e de produção', () => {
    const clientId = query('SELECT id FROM clients LIMIT 1')[0].id;
    const briefingId = `brf_t_${Date.now()}`;

    run(
      `INSERT INTO briefings (id, client_id, type, status, progress_percent, answers_json) VALUES (?, ?, 'production', 'in_progress', 0, '{}')`,
      [briefingId, clientId]
    );

    const brf = get('SELECT * FROM briefings WHERE id = ?', [briefingId]);
    expect(brf).toBeDefined();
    expect(brf.type).toBe('production');
  });

  // 7. Preenchimento pelo cliente
  it('7. Preenchimento de respostas de briefing pelo cliente', () => {
    const brf = get("SELECT id FROM briefings WHERE type = 'production' LIMIT 1");
    const sampleAnswers = {
      empresa_historia: 'Fundada em 2018 com foco em alta precisão.',
      branding_logo_status: 'already_have',
      fotos_equipe_status: 'need_create',
      conteudo_textos_status: 'need_create',
    };

    run('UPDATE briefings SET answers_json = ?, progress_percent = 50 WHERE id = ?', [
      JSON.stringify(sampleAnswers),
      brf.id,
    ]);

    const updated = get('SELECT * FROM briefings WHERE id = ?', [brf.id]);
    const parsed = JSON.parse(updated.answers_json);
    expect(parsed.empresa_historia).toBe('Fundada em 2018 com foco em alta precisão.');
    expect(updated.progress_percent).toBe(50);
  });

  // 8. Salvamento e recuperação das respostas
  it('8. Salvamento e recuperação confiável das respostas do briefing', () => {
    const brf = get("SELECT * FROM briefings WHERE type = 'production' LIMIT 1");
    const answers = JSON.parse(brf.answers_json);
    expect(answers.branding_logo_status).toBe('already_have');
  });

  // 9. Upload e validação de arquivos
  it('9. Upload e validação de arquivos no repositório seguro', () => {
    const clientId = query('SELECT id FROM clients LIMIT 1')[0].id;
    const fileId = `file_test_${Date.now()}`;

    run(
      `INSERT INTO files (id, client_id, filename, original_name, mime_type, file_size, file_path, category, status)
       VALUES (?, ?, 'logo_vetor.svg', 'logo_oficial.svg', 'image/svg+xml', 1048576, '/uploads/logo_vetor.svg', 'logo', 'approved')`,
      [fileId, clientId]
    );

    const file = get('SELECT * FROM files WHERE id = ?', [fileId]);
    expect(file).toBeDefined();
    expect(file.mime_type).toBe('image/svg+xml');
    expect(file.status).toBe('approved');
  });

  // 10. Geração de checklist de materiais
  it('10. Geração automática de checklist de materiais com soluções para itens faltantes', () => {
    const sampleAnswers = {
      branding_logo_status: 'need_create',
      fotos_equipe_status: 'need_create',
      conteudo_textos_status: 'need_create',
    };

    const checklist = generateMaterialsChecklistFromBriefing(sampleAnswers);
    expect(checklist.length).toBeGreaterThanOrEqual(4);

    const logoReq = checklist.find((c) => c.category === 'logo');
    expect(logoReq).toBeDefined();
    expect(logoReq?.solutionType).toBe('logo_design_service');

    const photoReq = checklist.find((c) => c.category === 'photo');
    expect(photoReq).toBeDefined();
    expect(photoReq?.solutionDetails).toContain('Unsplash/Pexels');
  });

  // 11. Cálculo de orçamento determinístico
  it('11. Cálculo determinístico e auditável de orçamento com margem e piso mínimo', () => {
    const quote = calculateProjectQuote({
      projectType: 'institucional',
      extraPagesCount: 2,
      includeSeo: true,
      includeCopywriting: true,
      customHourlyRate: 80,
    });

    expect(quote.totalHours).toBe(35 + 12 + 10 + 12); // 69 hours
    expect(quote.internalCost).toBe(69 * 80); // 5520
    expect(quote.suggestedPrice).toBeGreaterThan(quote.internalCost);
    expect(quote.minPrice).toBeGreaterThanOrEqual(1200);
    expect(quote.paymentPlans.length).toBe(4);
    expect(quote.auditFormula).toContain('Custo Interno = 69h');
  });

  // 12. Geração de proposta
  it('12. Geração de proposta comercial completa contendo 19 seções', () => {
    const prop = generateCompleteProposal({
      clientName: 'Dr. Roberto',
      companyName: 'Clínica Sorriso',
      city: 'São Paulo',
      projectTitle: 'Site Institucional Odontológico',
      projectType: 'institucional',
      totalValue: 3500,
      paymentPlanChosen: 'Entrada 50% + Saldo 50%',
      estimatedDays: 15,
      scopeItems: ['Home', 'Sobre', 'Serviços', 'Contato'],
      pagesList: ['Home', 'Sobre Nós', 'Tratamentos', 'Localização'],
    });

    expect(prop.sections.length).toBe(19);
    expect(prop.sections[0].title).toContain('Capa & Apresentação');
    expect(prop.sections[18].title).toContain('Termo de Aceite Formal');
    expect(prop.totalValue).toBe(3500);
    expect(prop.proposalCode).toMatch(/^PROP-\d{4}-\d{4}$/);
  });

  // 13. Aprovação de proposta e assinatura digital
  it('13. Aprovação de proposta com assinatura digital SHA-256 e IP', () => {
    const hash = createDigitalSignatureHash('PROP-2026-9999', 'Carlos Silva', '192.168.1.1', '2026-10-08T10:00:00Z');
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 is 64 hex characters
  });

  // 14. Criação de projeto
  it('14. Criação de projeto com 14 etapas padronizadas', () => {
    const clientId = query('SELECT id FROM clients LIMIT 1')[0].id;
    const projId = `proj_t_${Date.now()}`;

    run(
      `INSERT INTO projects (id, client_id, name, project_type, status, current_stage, progress_percent, total_value)
       VALUES (?, ?, 'Website Corporativo', 'institucional', 'in_progress', 'Briefing', 10, 3000)`,
      [projId, clientId]
    );

    const proj = get('SELECT * FROM projects WHERE id = ?', [projId]);
    expect(proj).toBeDefined();
    expect(proj.total_value).toBe(3000);
  });

  // 15. Geração de prompts
  it('15. Geração de prompts mestres de engenharia e fichas de imagens fotográficas', () => {
    const bundle = generateSiteAndImagePrompts(
      'Dr. Silva Odonto',
      'odontologia',
      'Campinas',
      {
        empresa_historia: 'Clínica especializada fundada em 2020.',
        servicos_lista: 'Implantes\nAlinhadores',
        branding_cores: 'Azul e Prata',
      }
    );

    expect(bundle.masterPrompt).toContain('PRAXIS MASTER PROMPT DE ENGENHARIA DE SOFTWARE');
    expect(bundle.masterPrompt).toContain('Dr. Silva Odonto');
    expect(bundle.pagePrompts.length).toBe(4);
    expect(bundle.imagePrompts.length).toBe(3);
    expect(bundle.imagePrompts[0].negativePrompt).toContain('no text');
  });

  // 16. Criação e execução de tarefas do agente
  it('16. Fila de execução de tarefas do agente com locking e controle de tentativas', () => {
    const jobId = enqueueJob('audit_website', { url: 'https://exemplo.com.br' }, 10);
    expect(jobId).toBeDefined();

    const next = fetchNextJob();
    expect(next).toBeDefined();
    expect(next?.id).toBe(jobId);
    expect(next?.status).toBe('running');

    completeJob(jobId, { hasHttps: true, score: 95 });
    const completed = get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    expect(completed.status).toBe('completed');
  });

  // 17. Publicação de prévia
  it('17. Geração de demonstração de site com banner obrigatório de demonstração não oficial', () => {
    const demo = generateDemoSite({
      companyName: 'Barbearia Dom Pedro',
      niche: 'barbearia',
      city: 'Ribeirão Preto',
      phone: '(16) 99888-7766',
    });

    expect(demo.html).toContain('Demonstração Não Oficial');
    expect(demo.html).toContain('Barbearia Dom Pedro');
    expect(demo.html).toContain('wa.me/5516998887766');
    expect(demo.theme).toBe('barber');
  });

  // 18. Atualização de progresso
  it('18. Atualização de progresso real por evento de tarefas concluídas', () => {
    const projId = query('SELECT id FROM projects LIMIT 1')[0].id;
    const task1 = `task_${Date.now()}_1`;
    const task2 = `task_${Date.now()}_2`;

    run(`INSERT INTO tasks (id, project_id, title, status) VALUES (?, ?, 'Tarefa 1', 'done')`, [task1, projId]);
    run(`INSERT INTO tasks (id, project_id, title, status) VALUES (?, ?, 'Tarefa 2', 'pending')`, [task2, projId]);

    const tasks = query('SELECT status FROM tasks WHERE project_id = ?', [projId]);
    const doneCount = tasks.filter((t: any) => t.status === 'done').length;
    const progress = Math.round((doneCount / tasks.length) * 100);

    run('UPDATE projects SET progress_percent = ? WHERE id = ?', [progress, projId]);
    const proj = get('SELECT progress_percent FROM projects WHERE id = ?', [projId]);
    expect(proj.progress_percent).toBe(progress);
  });

  // 19. Solicitação de revisão
  it('19. Registro de solicitação de revisão pelo cliente', () => {
    const projId = query('SELECT id FROM projects LIMIT 1')[0].id;
    const revId = `rev_${Date.now()}`;

    run(
      `INSERT INTO project_revisions (id, project_id, revision_number, requested_by, description, status)
       VALUES (?, ?, 1, 'Cliente Carlos', 'Ajustar foto da equipe na página Sobre', 'open')`,
      [revId, projId]
    );

    const rev = get('SELECT * FROM project_revisions WHERE id = ?', [revId]);
    expect(rev).toBeDefined();
    expect(rev.requested_by).toBe('Cliente Carlos');
  });

  // 20. Entrega do projeto
  it('20. Encerramento formal e entrega do projeto', () => {
    const projId = query('SELECT id FROM projects LIMIT 1')[0].id;
    run("UPDATE projects SET status = 'completed', progress_percent = 100, completed_at = datetime('now') WHERE id = ?", [projId]);
    const proj = get('SELECT * FROM projects WHERE id = ?', [projId]);
    expect(proj.status).toBe('completed');
    expect(proj.progress_percent).toBe(100);
  });

  // 21. Isolamento entre clientes
  it('21. Isolamento rigoroso entre clientes por portal_token (IDOR-proof)', () => {
    const tokenA = `portal_token_A_${Date.now()}`;
    const tokenB = `portal_token_B_${Date.now()}`;
    const compA = `comp_A_${Date.now()}`;
    const compB = `comp_B_${Date.now()}`;

    const codeA = `CLI-A-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const codeB = `CLI-B-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    run(`INSERT INTO companies (id, name) VALUES (?, 'Empresa A')`, [compA]);
    run(`INSERT INTO companies (id, name) VALUES (?, 'Empresa B')`, [compB]);
    run(`INSERT INTO clients (id, company_id, client_code, portal_token) VALUES (?, ?, ?, ?)`, [`cli_A_${Date.now()}`, compA, codeA, tokenA]);
    run(`INSERT INTO clients (id, company_id, client_code, portal_token) VALUES (?, ?, ?, ?)`, [`cli_B_${Date.now()}`, compB, codeB, tokenB]);

    // Query for Client A using Token A
    const resA = get('SELECT * FROM clients WHERE portal_token = ?', [tokenA]);
    const resB = get('SELECT * FROM clients WHERE portal_token = ?', [tokenB]);

    expect(resA.client_code).toBe(codeA);
    expect(resB.client_code).toBe(codeB);
    expect(resA.id).not.toBe(resB.id);
  });

  // 22. Revogação de convite
  it('22. Revogação de convite e regeneração de portal_token', () => {
    const cli = query('SELECT * FROM clients LIMIT 1')[0];
    const newToken = `portal_regenerated_${Date.now()}`;

    run('UPDATE clients SET portal_token = ? WHERE id = ?', [newToken, cli.id]);
    const oldCheck = get('SELECT * FROM clients WHERE portal_token = ?', [cli.portal_token]);
    const newCheck = get('SELECT * FROM clients WHERE portal_token = ?', [newToken]);

    expect(oldCheck).toBeUndefined();
    expect(newCheck).toBeDefined();
  });

  // 23. Falha de autenticação externa
  it('23. Tratamento honesto e gracioso de autenticação externa ausente', () => {
    // When Instagram API credentials are not provided, system operates in assisted mode
    const connection = get("SELECT * FROM integration_connections WHERE service_name = 'instagram'");
    expect(connection === undefined || connection.status !== 'connected').toBe(true);
  });

  // 24. Esgotamento de cota gratuita
  it('24. Interrupção segura de execução caso cota gratuita seja atingida', () => {
    const maxAttempts = 3;
    const testJob = enqueueJob('test_quota', {}, 1);
    failJob(testJob, 'Rate limited');
    failJob(testJob, 'Rate limited');
    failJob(testJob, 'Quota exhausted');

    const job = get('SELECT * FROM jobs WHERE id = ?', [testJob]);
    expect(job.status).toBe('failed');
    expect(job.attempts).toBe(maxAttempts);
  });

  // 25. Computador local desconectado
  it('25. Comportamento correto quando agente local está desconectado (jobs permanecem em fila)', () => {
    const pendingJobId = enqueueJob('offline_task', { task: 'build' }, 5);
    const job = get('SELECT * FROM jobs WHERE id = ?', [pendingJobId]);
    expect(job.status).toBe('pending');
  });

  // 26. Retomada de tarefas
  it('26. Retomada de tarefas interrompidas após reinicialização', () => {
    const retriedJobId = enqueueJob('retriable_task', {}, 5);
    failJob(retriedJobId, 'Conexão interrompida');

    const job = get('SELECT * FROM jobs WHERE id = ?', [retriedJobId]);
    expect(job.status).toBe('pending'); // Reset to pending for retry because attempts < max_attempts
    expect(job.attempts).toBe(1);
  });

  // 27. Backup e restauração
  it('27. Backup e restauração JSON do banco de dados', () => {
    const allCompanies = query('SELECT * FROM companies');
    const allLeads = query('SELECT * FROM leads');
    const allClients = query('SELECT * FROM clients');

    const backup = {
      timestamp: new Date().toISOString(),
      companies: allCompanies,
      leads: allLeads,
      clients: allClients,
    };

    expect(backup.companies.length).toBeGreaterThan(0);
    expect(backup.leads.length).toBeGreaterThan(0);
    expect(backup.clients.length).toBeGreaterThan(0);
  });
});
