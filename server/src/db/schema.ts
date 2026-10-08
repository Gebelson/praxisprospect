import { DatabaseSync } from 'node:sqlite';

export const initSchema = (db: DatabaseSync) => {
  // Execute DDL for all 57 entities
  db.exec(`
    -- 1. Users & Auth
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      permission TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    -- 2. Companies & Contacts
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trade_name TEXT,
      cnpj TEXT,
      segment TEXT,
      niche TEXT,
      country TEXT DEFAULT 'Brasil',
      state TEXT,
      city TEXT,
      neighborhood TEXT,
      address TEXT,
      postal_code TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      instagram TEXT,
      facebook TEXT,
      linkedin TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      whatsapp TEXT,
      is_primary INTEGER DEFAULT 1,
      consent_status TEXT DEFAULT 'unknown',
      opt_out INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- 3. CRM, Leads & Discovery
    CREATE TABLE IF NOT EXISTS lead_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER DEFAULT 1,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS crm_stages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      order_index INTEGER NOT NULL,
      color TEXT DEFAULT '#3B82F6',
      is_won INTEGER DEFAULT 0,
      is_lost INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      stage_id TEXT NOT NULL,
      niche TEXT,
      source TEXT NOT NULL DEFAULT 'OpenStreetMap',
      score INTEGER DEFAULT 0,
      score_priority TEXT DEFAULT 'moderado',
      potential_value REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES crm_stages(id)
    );

    CREATE TABLE IF NOT EXISTS lead_scores (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      priority TEXT NOT NULL,
      score_breakdown_json TEXT NOT NULL,
      explanation TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lead_research (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      has_website INTEGER DEFAULT 0,
      is_responsive INTEGER DEFAULT 0,
      has_https INTEGER DEFAULT 0,
      seo_issues TEXT,
      technical_issues TEXT,
      visual_notes TEXT,
      verified_facts TEXT,
      ai_hypotheses TEXT,
      raw_data_json TEXT,
      source_name TEXT DEFAULT 'OpenStreetMap Overpass',
      researched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS crm_activities (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      client_id TEXT,
      user_id TEXT,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      scheduled_for DATETIME NOT NULL,
      channel TEXT NOT NULL DEFAULT 'whatsapp',
      message_draft TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    -- 4. Clients & Portal
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      lead_id TEXT,
      client_code TEXT UNIQUE NOT NULL,
      portal_token TEXT UNIQUE NOT NULL,
      portal_token_expires_at DATETIME,
      status TEXT DEFAULT 'active',
      total_contracted REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- 5. Briefings
    CREATE TABLE IF NOT EXISTS briefing_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'commercial' or 'production'
      questions_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS briefings (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      project_id TEXT,
      type TEXT NOT NULL, -- 'commercial' or 'production'
      template_id TEXT,
      status TEXT DEFAULT 'pending', -- 'draft', 'sent', 'in_progress', 'completed'
      progress_percent INTEGER DEFAULT 0,
      answers_json TEXT,
      submitted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS briefing_questions (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      step INTEGER NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      field_type TEXT NOT NULL,
      options_json TEXT,
      is_required INTEGER DEFAULT 1,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (template_id) REFERENCES briefing_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS briefing_answers (
      id TEXT PRIMARY KEY,
      briefing_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_value TEXT,
      status TEXT DEFAULT 'answered',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (briefing_id) REFERENCES briefings(id) ON DELETE CASCADE
    );

    -- 6. Files & Material Requirements
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      project_id TEXT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      status TEXT DEFAULT 'uploaded', -- 'uploaded', 'approved', 'rejected'
      validation_notes TEXT,
      uploaded_by TEXT DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS file_permissions (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      can_download INTEGER DEFAULT 1,
      can_delete INTEGER DEFAULT 0,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS material_requirements (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      briefing_id TEXT,
      description TEXT NOT NULL,
      category TEXT NOT NULL, -- 'logo', 'text', 'photo', 'credential', 'palette'
      is_mandatory INTEGER DEFAULT 1,
      responsible TEXT DEFAULT 'client',
      status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'reviewing', 'approved', 'rejected', 'dismissed'
      solution_type TEXT, -- 'stock_photo', 'copywriting_addon', 'logo_design_addon'
      solution_details TEXT,
      file_id TEXT,
      due_date DATE,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
    );

    -- 7. Pricing & Quotes
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      category TEXT NOT NULL,
      value_number REAL NOT NULL,
      value_json TEXT,
      unit TEXT DEFAULT 'BRL',
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      client_id TEXT,
      title TEXT NOT NULL,
      project_type TEXT NOT NULL,
      total_suggested REAL NOT NULL,
      min_price REAL NOT NULL,
      total_cost REAL NOT NULL,
      target_margin REAL NOT NULL,
      urgency_multiplier REAL DEFAULT 1.0,
      payment_terms_json TEXT,
      breakdown_json TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      estimated_hours REAL NOT NULL,
      hourly_rate REAL NOT NULL,
      unit_price REAL NOT NULL,
      quantity REAL DEFAULT 1,
      total REAL NOT NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    -- 8. Proposals
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      quote_id TEXT,
      client_id TEXT,
      lead_id TEXT,
      title TEXT NOT NULL,
      proposal_code TEXT UNIQUE NOT NULL,
      public_token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'revision_requested'
      version INTEGER DEFAULT 1,
      valid_until DATE NOT NULL,
      total_value REAL NOT NULL,
      payment_structure_json TEXT,
      content_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proposal_versions (
      id TEXT PRIMARY KEY,
      proposal_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      content_json TEXT NOT NULL,
      total_value REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposal_acceptances (
      id TEXT PRIMARY KEY,
      proposal_id TEXT NOT NULL,
      client_id TEXT,
      accepted_by_name TEXT NOT NULL,
      accepted_by_email TEXT NOT NULL,
      accepted_ip TEXT,
      user_agent TEXT,
      terms_accepted INTEGER DEFAULT 1,
      signature_hash TEXT NOT NULL,
      feedback_notes TEXT,
      accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
    );

    -- 9. Projects & Stages
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      proposal_id TEXT,
      name TEXT NOT NULL,
      project_type TEXT NOT NULL,
      status TEXT DEFAULT 'planning', -- 'planning', 'in_progress', 'review', 'delayed', 'completed', 'canceled'
      current_stage TEXT DEFAULT 'Briefing',
      progress_percent INTEGER DEFAULT 0,
      target_deadline DATE,
      completed_at DATETIME,
      total_value REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_stages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      stage_code TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'waiting_client', 'waiting_agency', 'in_progress', 'completed', 'blocked'
      weight_percent INTEGER NOT NULL,
      started_at DATETIME,
      completed_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      stage_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT DEFAULT 'team',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'review', 'done', 'blocked'
      estimated_hours REAL DEFAULT 0,
      actual_hours REAL DEFAULT 0,
      due_date DATE,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES project_stages(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_dependencies (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      depends_on_task_id TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS task_events (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      project_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_progress (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      progress_percent INTEGER NOT NULL,
      calculated_by_events_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_revisions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      revision_number INTEGER NOT NULL,
      section_ref TEXT,
      requested_by TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'rejected'
      resolution_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      stage_id TEXT,
      item_type TEXT NOT NULL,
      item_id TEXT,
      approved_by TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      notes TEXT,
      approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 10. Websites, Demos & Deployments
    CREATE TABLE IF NOT EXISTS websites (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      project_id TEXT,
      name TEXT NOT NULL,
      niche TEXT NOT NULL,
      template_id TEXT NOT NULL,
      custom_css TEXT,
      custom_data_json TEXT NOT NULL,
      html_content TEXT,
      is_demo INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ready',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS website_versions (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      html_content TEXT NOT NULL,
      changelog TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS previews (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      preview_token TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      password_hash TEXT,
      expires_at DATETIME,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      project_id TEXT,
      environment TEXT DEFAULT 'preview',
      url TEXT,
      status TEXT DEFAULT 'pending',
      deployed_by TEXT DEFAULT 'agent',
      deploy_logs TEXT,
      deployed_at DATETIME,
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deployment_checks (
      id TEXT PRIMARY KEY,
      deployment_id TEXT NOT NULL,
      check_type TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
    );

    -- 11. Prompts (Sites & Images)
    CREATE TABLE IF NOT EXISTS image_prompts (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      website_id TEXT,
      title TEXT NOT NULL,
      target_page TEXT NOT NULL,
      target_section TEXT NOT NULL,
      purpose TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      photographic_style TEXT DEFAULT 'Realista / Editorial',
      aspect_ratio TEXT DEFAULT '16:9',
      color_palette TEXT,
      composition TEXT,
      negative_prompt TEXT,
      status TEXT DEFAULT 'ready',
      generated_file_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_prompts (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      website_id TEXT,
      prompt_type TEXT NOT NULL, -- 'master', 'page', 'feature', 'refactor'
      title TEXT NOT NULL,
      prompt_content TEXT NOT NULL,
      target_page TEXT,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prompt_versions (
      id TEXT PRIMARY KEY,
      site_prompt_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      prompt_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_prompt_id) REFERENCES site_prompts(id) ON DELETE CASCADE
    );

    -- 12. Automations & ECA Engine
    CREATE TABLE IF NOT EXISTS automations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trigger_event TEXT NOT NULL,
      conditions_json TEXT NOT NULL,
      actions_json TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      execution_count INTEGER DEFAULT 0,
      last_triggered_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS automation_runs (
      id TEXT PRIMARY KEY,
      automation_id TEXT NOT NULL,
      trigger_event TEXT NOT NULL,
      status TEXT NOT NULL, -- 'success', 'failed', 'skipped'
      payload_json TEXT,
      result_json TEXT,
      error_message TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
    );

    -- 13. Jobs & Praxis Agent
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      job_type TEXT NOT NULL, -- 'audit_website', 'generate_site_demo', 'compile_prompts', 'verify_deploy'
      payload_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'canceled'
      priority INTEGER DEFAULT 10,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      result_json TEXT,
      error_message TEXT,
      scheduled_for DATETIME,
      locked_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_attempts (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      attempt_number INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME,
      error_message TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS local_agents (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      machine_name TEXT NOT NULL,
      status TEXT DEFAULT 'online', -- 'online', 'offline', 'busy'
      last_heartbeat_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      capabilities_json TEXT,
      current_job_id TEXT,
      os_info TEXT,
      antigravity_status TEXT DEFAULT 'detected',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. Messaging & Outreach
    CREATE TABLE IF NOT EXISTS message_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      channel TEXT NOT NULL, -- 'whatsapp', 'instagram', 'email', 'linkedin'
      category TEXT NOT NULL, -- 'cold_outreach', 'demo_presentation', 'followup', 'proposal', 'materials'
      subject TEXT,
      template_text TEXT NOT NULL,
      variables_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      client_id TEXT,
      channel TEXT NOT NULL,
      direction TEXT DEFAULT 'outbound',
      subject TEXT,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft', -- 'draft', 'ready', 'sent', 'delivered', 'failed'
      scheduled_for DATETIME,
      sent_at DATETIME,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 16. Financial Module
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      client_id TEXT NOT NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'canceled'
      payment_method TEXT DEFAULT 'pix',
      notes TEXT,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT,
      project_id TEXT,
      client_id TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_method TEXT DEFAULT 'pix',
      receipt_ref TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recurring_services (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      project_id TEXT,
      title TEXT NOT NULL,
      monthly_fee REAL NOT NULL,
      billing_day INTEGER DEFAULT 10,
      status TEXT DEFAULT 'active',
      started_at DATE NOT NULL,
      notes TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    -- 17. Auditing, Settings & Integrations
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      changes_json TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS integration_connections (
      id TEXT PRIMARY KEY,
      service_name TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'local_only', 'error'
      credentials_masked_json TEXT,
      settings_json TEXT,
      last_checked_at DATETIME,
      is_active INTEGER DEFAULT 0
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id);
    CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
    CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
    CREATE INDEX IF NOT EXISTS idx_companies_niche ON companies(niche);
    CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_briefings_client ON briefings(client_id);
    CREATE INDEX IF NOT EXISTS idx_proposals_client ON proposals(client_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, priority DESC);
  `);
};

export const seedInitialData = (db: DatabaseSync) => {
  // 1. Seed CRM Stages
  const stagesCount = Number(db.prepare('SELECT count(*) as cnt FROM crm_stages').get()?.cnt ?? 0);
  if (stagesCount === 0) {
    const insertStage = db.prepare(`
      INSERT INTO crm_stages (id, name, code, order_index, color, is_won, is_lost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultStages = [
      ['stage_1', 'Descoberto', 'discovered', 1, '#94A3B8', 0, 0],
      ['stage_2', 'Pesquisado', 'researched', 2, '#64748B', 0, 0],
      ['stage_3', 'Qualificado', 'qualified', 3, '#3B82F6', 0, 0],
      ['stage_4', 'Demonstração Preparada', 'demo_ready', 4, '#60A5FA', 0, 0],
      ['stage_5', 'Aguardando Abordagem', 'ready_outreach', 5, '#818CF8', 0, 0],
      ['stage_6', 'Contatado', 'contacted', 6, '#A78BFA', 0, 0],
      ['stage_7', 'Respondeu', 'replied', 7, '#C084FC', 0, 0],
      ['stage_8', 'Interessado', 'interested', 8, '#F472B6', 0, 0],
      ['stage_9', 'Briefing Enviado', 'briefing_sent', 9, '#FB923C', 0, 0],
      ['stage_10', 'Briefing Recebido', 'briefing_received', 10, '#FBBF24', 0, 0],
      ['stage_11', 'Proposta Enviada', 'proposal_sent', 11, '#FACC15', 0, 0],
      ['stage_12', 'Negociação', 'negotiating', 12, '#A3E635', 0, 0],
      ['stage_13', 'Fechado (Ganho)', 'closed_won', 13, '#10B981', 1, 0],
      ['stage_14', 'Perdido', 'closed_lost', 14, '#EF4444', 0, 1],
      ['stage_15', 'Sem Interesse', 'uninterested', 15, '#6B7280', 0, 1],
    ];

    for (const s of defaultStages) {
      insertStage.run(s[0], s[1], s[2], s[3], s[4], s[5], s[6]);
    }
  }

  // 2. Seed Lead Sources
  const sourcesCount = Number(db.prepare('SELECT count(*) as cnt FROM lead_sources').get()?.cnt ?? 0);
  if (sourcesCount === 0) {
    const insertSource = db.prepare('INSERT INTO lead_sources (id, name, is_active, notes) VALUES (?, ?, 1, ?)');
    insertSource.run('src_osm', 'OpenStreetMap Overpass API', 'Dados abertos geográficos e comerciais');
    insertSource.run('src_receita', 'Dados Abertos / CNPJ', 'Bases cadastrais públicas');
    insertSource.run('src_manual', 'Cadastro Manual', 'Inserção manual de lead');
    insertSource.run('src_csv', 'Importação CSV', 'Planilhas externas');
  }

  // 3. Seed Pricing Rules
  const pricingRulesCount = Number(db.prepare('SELECT count(*) as cnt FROM pricing_rules').get()?.cnt ?? 0);
  if (pricingRulesCount === 0) {
    const insertRule = db.prepare(`
      INSERT INTO pricing_rules (id, key, label, category, value_number, value_json, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const rules = [
      ['pr_hourly_rate', 'hourly_rate', 'Custo-Hora Padrão', 'rates', 80.0, null, 'BRL/h', 'Valor base da hora de desenvolvimento'],
      ['pr_min_project_value', 'min_project_value', 'Valor Mínimo Sugerido', 'limits', 1200.0, null, 'BRL', 'Piso comercial mínimo para qualquer projeto'],
      ['pr_target_margin', 'target_margin', 'Margem de Lucro Alvo', 'margins', 0.45, null, '%', 'Margem desejada (45%)'],
      ['pr_risk_reserve', 'risk_reserve', 'Reserva de Risco', 'margins', 0.15, null, '%', 'Percentual de contingência para imprevistos (15%)'],
      ['pr_lp_base_hours', 'lp_base_hours', 'Horas Base - Landing Page', 'scope', 18.0, null, 'horas', 'Landing page padrão de alta conversão'],
      ['pr_inst_base_hours', 'inst_base_hours', 'Horas Base - Institucional', 'scope', 35.0, null, 'horas', 'Site institucional (até 5 páginas)'],
      ['pr_multi_base_hours', 'multi_base_hours', 'Horas Base - Multipáginas', 'scope', 55.0, null, 'horas', 'Site corporativo complexo'],
      ['pr_ecom_base_hours', 'ecom_base_hours', 'Horas Base - E-commerce', 'scope', 80.0, null, 'horas', 'Loja virtual completa com catálogo e gateway'],
      ['pr_page_addon_hours', 'page_addon_hours', 'Horas por Página Adicional', 'scope', 6.0, null, 'horas', 'Custo de elaboração por página extra'],
      ['pr_seo_addon_hours', 'seo_addon_hours', 'Horas - Pacote SEO Técnico', 'scope', 10.0, null, 'horas', 'Otimização semântica, metatags, schema.org'],
      ['pr_urgency_factor', 'urgency_factor', 'Taxa de Urgência', 'modifiers', 1.35, null, 'fator', 'Acréscimo de 35% para prazos apertados'],
      ['pr_revisions_included', 'revisions_included', 'Rodadas de Revisão Inclusas', 'scope', 2.0, null, 'qtd', 'Número padrão de revisões incluídas'],
    ];

    for (const r of rules) {
      insertRule.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]);
    }
  }

  // 4. Seed Message Templates
  const templatesCount = Number(db.prepare('SELECT count(*) as cnt FROM message_templates').get()?.cnt ?? 0);
  if (templatesCount === 0) {
    const insertTemplate = db.prepare(`
      INSERT INTO message_templates (id, name, channel, category, subject, template_text, variables_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    insertTemplate.run(
      'tpl_wa_outreach',
      'Abordagem WhatsApp com Demonstração',
      'whatsapp',
      'cold_outreach',
      null,
      'Olá, equipe da {{empresa}}! Tudo bem?\n\nMeu nome é {{agencia_responsavel}} da Praxis Web. Estive pesquisando empresas de destaque em {{cidade}} no segmento de {{nicho}} e notei uma grande oportunidade de fortalecer a presença online da {{empresa}}.\n\nPara mostrar na prática como a marca de vocês pode transmitir ainda mais autoridade, preparei uma demonstração visual personalizada e sem compromisso:\n👉 {{link_demo}}\n\nO que achou da proposta visual? Se fizer sentido, podemos conversar 10 minutos para alinhar como colocar isso no ar!',
      JSON.stringify(['empresa', 'agencia_responsavel', 'cidade', 'nicho', 'link_demo'])
    );

    insertTemplate.run(
      'tpl_ig_outreach',
      'Abordagem Instagram Direct',
      'instagram',
      'cold_outreach',
      null,
      'Olá, pessoal da @{{instagram}}! Acompanho o trabalho de vocês em {{cidade}} e acho excelente. Desenvolvi uma prévia exclusiva de como seria o novo site de alta conversão da {{empresa}}: {{link_demo}}. Se quiserem dar uma olhada, me contem o que acharam!',
      JSON.stringify(['instagram', 'cidade', 'empresa', 'link_demo'])
    );

    insertTemplate.run(
      'tpl_mail_proposal',
      'Envio de Proposta Comercial',
      'email',
      'proposal',
      'Proposta de Desenvolvimento Web — {{empresa}}',
      'Prezado(a) {{nome_contato}},\n\nFoi um prazer entender os objetivos e diferenciais da {{empresa}}.\n\nConforme conversamos, elaborei uma proposta comercial completa e detalhada para o desenvolvimento do novo site institucional, incluindo todas as funcionalidades, cronograma de entregas e condições especiais:\n\n🔗 Acesse sua proposta aqui: {{link_proposta}}\n\nFico à total disposição para tirar qualquer dúvida e iniciar os trabalhos!\n\nAtenciosamente,\n{{agencia_nome}}',
      JSON.stringify(['nome_contato', 'empresa', 'link_proposta', 'agencia_nome'])
    );

    insertTemplate.run(
      'tpl_wa_briefing',
      'Envio de Briefing de Produção',
      'whatsapp',
      'materials',
      null,
      'Parabéns pelo fechamento do projeto, {{nome_contato}}! 🚀\n\nAgora vamos dar o pontapé inicial no desenvolvimento do site da {{empresa}}.\n\nPara que tudo fique exatamente com a identidade de vocês, preparamos um formulário rápido e guiado no Portal do Cliente:\n👉 {{link_briefing}}\n\nLá você pode responder as perguntas em etapas, enviar logo, fotos e textos com salvamento automático.',
      JSON.stringify(['nome_contato', 'empresa', 'link_briefing'])
    );
  }

  // 5. Seed Default Agency Settings
  const defaultSettings = [
    ['agency_profile', JSON.stringify({
      name: 'Praxis Digital Studio',
      tradeName: 'Praxis Web & Automação',
      email: 'contato@praxis.local',
      phone: '(11) 98765-4321',
      whatsapp: '5511987654321',
      website: 'https://praxis.local',
      cnpj: '00.000.000/0001-00',
      address: 'São Paulo, SP - Brasil',
      brandPrimary: '#3B82F6',
      brandDark: '#0A0D14',
    }), 'agency', 'Dados cadastrais da agência'],
    ['ai_settings', JSON.stringify({
      provider: 'local_antigravity',
      model: 'gemini-3.8-flash',
      localAgentPort: 3002,
      useDeterministicFallbacks: true,
      maxExecutionJobs: 3,
    }), 'ai', 'Configurações de Inteligência Artificial e Agente Local'],
    ['scoring_weights', JSON.stringify({
      noWebsite: 40,
      notResponsive: 25,
      noHttps: 15,
      hasPhone: 10,
      hasEmail: 10,
    }), 'scoring', 'Pesos do cálculo de Score de Leads'],
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value_json, category, description, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const s of defaultSettings) {
    insertSetting.run(s[0], s[1], s[2], s[3]);
  }

  // 6. Seed Default Automations
  const automationsCount = Number(db.prepare('SELECT count(*) as cnt FROM automations').get()?.cnt ?? 0);
  if (automationsCount === 0) {
    const insertAuto = db.prepare(`
      INSERT INTO automations (id, name, trigger_event, conditions_json, actions_json, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `);

    insertAuto.run(
      'auto_1',
      'Qualificar Lead Automaticamente com Score Alto',
      'LEAD_CREATED',
      JSON.stringify([{ field: 'score', operator: '>=', value: 70 }]),
      JSON.stringify([
        { action: 'UPDATE_STAGE', stageCode: 'qualified' },
        { action: 'CREATE_NOTIFICATION', title: 'Lead de Alto Potencial Detectado', type: 'success' },
        { action: 'ENQUEUE_JOB', jobType: 'generate_site_demo' },
      ])
    );

    insertAuto.run(
      'auto_2',
      'Gerar Checklist de Materiais ao Concluir Briefing',
      'BRIEFING_COMPLETED',
      JSON.stringify([{ field: 'type', operator: '==', value: 'production' }]),
      JSON.stringify([
        { action: 'GENERATE_MATERIALS_CHECKLIST' },
        { action: 'UPDATE_PROJECT_PROGRESS', advanceStage: 'Recebimento de Materiais' },
        { action: 'CREATE_NOTIFICATION', title: 'Briefing de Produção Recebido', type: 'info' },
      ])
    );

    insertAuto.run(
      'auto_3',
      'Criar Projeto e Fatura ao Aprovar Proposta',
      'PROPOSAL_ACCEPTED',
      JSON.stringify([]),
      JSON.stringify([
        { action: 'CONVERT_TO_PROJECT' },
        { action: 'GENERATE_FIRST_INVOICE' },
        { action: 'SEND_PRODUCTION_BRIEFING_INVITE' },
        { action: 'CREATE_NOTIFICATION', title: 'Proposta Aprovada pelo Cliente! 🎉', type: 'success' },
      ])
    );
  }
};
