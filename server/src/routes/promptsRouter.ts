import { Router } from 'express';
import crypto from 'crypto';
import { generateSiteAndImagePrompts } from '../services/promptGeneratorService.js';
import { query, get, run, transaction } from '../db/database.js';

export const promptsRouter = Router();

promptsRouter.post('/generate', (req, res) => {
  try {
    const { projectId, websiteId, companyName, niche, city, briefingAnswers } = req.body;
    if (!companyName || !niche) {
      return res.status(400).json({ error: 'Nome da empresa e nicho são obrigatórios.' });
    }

    const bundle = generateSiteAndImagePrompts(
      companyName,
      niche,
      city || 'São Paulo',
      briefingAnswers || {}
    );

    const masterPromptId = `sprompt_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      // 1. Insert Master Prompt
      run(
        `INSERT INTO site_prompts (id, project_id, website_id, prompt_type, title, prompt_content, created_at)
         VALUES (?, ?, ?, 'master', ?, ?, CURRENT_TIMESTAMP)`,
        [
          masterPromptId,
          projectId || null,
          websiteId || null,
          `Master Prompt de Engenharia — ${companyName}`,
          bundle.masterPrompt,
        ]
      );

      // 2. Insert Image Prompts
      for (const img of bundle.imagePrompts) {
        run(
          `INSERT INTO image_prompts (
            id, project_id, website_id, title, target_page, target_section, purpose, 
            prompt_text, photographic_style, aspect_ratio, negative_prompt, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', CURRENT_TIMESTAMP)`,
          [
            `imgp_${crypto.randomBytes(6).toString('hex')}`,
            projectId || null,
            websiteId || null,
            img.title,
            img.targetPage,
            img.targetSection,
            img.purpose,
            img.promptText,
            img.photographicStyle,
            img.aspectRatio,
            img.negativePrompt,
          ]
        );
      }
    });

    res.json({
      success: true,
      masterPromptId,
      masterPrompt: bundle.masterPrompt,
      pagePrompts: bundle.pagePrompts,
      imagePrompts: bundle.imagePrompts,
      message: 'Prompts de desenvolvimento e direção de arte de imagens gerados com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

promptsRouter.get('/', (req, res) => {
  try {
    const masterPrompts = query('SELECT * FROM site_prompts ORDER BY created_at DESC');
    const imagePrompts = query('SELECT * FROM image_prompts ORDER BY created_at DESC');
    res.json({ masterPrompts, imagePrompts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
