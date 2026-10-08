import { Router } from 'express';
import crypto from 'crypto';
import { generateDemoSite, SiteGenerationInput } from '../services/siteGeneratorService.js';
import { query, get, run, transaction } from '../db/database.js';

export const sitesRouter = Router();

sitesRouter.post('/generate-demo', (req, res) => {
  try {
    const { leadId, projectId, companyName, niche, city, phone, address, primaryColor } = req.body;
    if (!companyName || !niche) {
      return res.status(400).json({ error: 'Nome da empresa e Nicho são obrigatórios.' });
    }

    const demo = generateDemoSite({
      companyName,
      niche,
      city: city || 'São Paulo',
      phone,
      address,
      primaryColor,
    });

    const websiteId = `site_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      // 1. Insert Website
      run(
        `INSERT INTO websites (id, lead_id, project_id, name, niche, template_id, custom_data_json, html_content, is_demo, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'ready', CURRENT_TIMESTAMP)`,
        [
          websiteId,
          leadId || null,
          projectId || null,
          companyName,
          niche,
          demo.theme,
          JSON.stringify({ city, phone, address }),
          demo.html,
        ]
      );

      // 2. Insert Preview with secure token
      run(
        `INSERT INTO previews (id, website_id, preview_token, is_active, views_count, created_at)
         VALUES (?, ?, ?, 1, 0, CURRENT_TIMESTAMP)`,
        [`prev_${crypto.randomBytes(6).toString('hex')}`, websiteId, demo.previewToken]
      );

      // 3. Log activity if linked to lead
      if (leadId) {
        run(
          `INSERT INTO crm_activities (id, lead_id, activity_type, title, description, created_at)
           VALUES (?, ?, 'demo_generated', 'Site Demonstrativo Gerado', ?, CURRENT_TIMESTAMP)`,
          [
            `act_${crypto.randomBytes(6).toString('hex')}`,
            leadId,
            `Demonstração interativa gerada com tema "${demo.theme}". Link de prévia disponível.`,
          ]
        );
      }
    });

    res.json({
      success: true,
      websiteId,
      previewToken: demo.previewToken,
      previewUrl: `/api/sites/preview/${demo.previewToken}`,
      theme: demo.theme,
      sections: demo.sections,
      message: 'Demonstração de site gerada com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

sitesRouter.get('/', (req, res) => {
  try {
    const sites = query(`
      SELECT 
        w.*, p.preview_token, p.views_count,
        c.name as company_name, c.city
      FROM websites w
      JOIN previews p ON p.website_id = w.id
      LEFT JOIN leads l ON w.lead_id = l.id
      LEFT JOIN companies c ON l.company_id = c.id
      ORDER BY w.created_at DESC
    `);
    res.json(sites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

sitesRouter.get('/:id', (req, res) => {
  try {
    const site = get('SELECT * FROM websites WHERE id = ?', [req.params.id]);
    if (!site) {
      return res.status(404).json({ error: 'Site não encontrado.' });
    }

    const preview = get('SELECT * FROM previews WHERE website_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.id]);

    res.json({
      site,
      previewToken: preview?.preview_token,
      previewUrl: preview ? `/api/sites/preview/${preview.preview_token}` : null,
      viewsCount: preview?.views_count || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Standalone raw HTML preview endpoint for iframes / public demo viewing
sitesRouter.get('/preview/:token', (req, res) => {
  try {
    const preview = get('SELECT * FROM previews WHERE preview_token = ? AND is_active = 1', [req.params.token]);
    if (!preview) {
      return res.status(404).send('<h1>Demonstração não encontrada ou expirada.</h1>');
    }

    // Increment view count
    run('UPDATE previews SET views_count = views_count + 1 WHERE id = ?', [preview.id]);

    const website = get('SELECT html_content FROM websites WHERE id = ?', [preview.website_id]);
    if (!website || !website.html_content) {
      return res.status(404).send('<h1>Conteúdo da demonstração indisponível.</h1>');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(website.html_content);
  } catch (error: any) {
    res.status(500).send(`Erro ao renderizar prévia: ${error.message}`);
  }
});
