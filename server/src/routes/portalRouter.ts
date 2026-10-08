import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query, get, run, transaction } from '../db/database.js';
import { createDigitalSignatureHash } from '../services/proposalService.js';
import { dispatchAutomationEvent } from '../services/automationEngine.js';

export const portalRouter = Router();

// Configure safe local uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer with safe limits (max 15MB, restricted file extensions)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf', '.docx', '.ai', '.eps', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido (${ext}). Envie imagens, PDFs ou documentos autorizados.`));
    }
  },
});

// Middleware to resolve and isolate client by portal_token
const validateClientToken = (token: string) => {
  const client = get(`
    SELECT 
      c.id as client_id, c.client_code, c.status as client_status,
      comp.id as company_id, comp.name as company_name, comp.trade_name, comp.city, comp.phone, comp.email
    FROM clients c
    JOIN companies comp ON c.company_id = comp.id
    WHERE c.portal_token = ?
  `, [token]);
  return client;
};

// 1. Project & Overview
portalRouter.get('/:token/project', (req, res) => {
  try {
    const client = validateClientToken(req.params.token);
    if (!client) {
      return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
    }

    const project = get(`
      SELECT id, name, project_type, status, current_stage, progress_percent, target_deadline
      FROM projects 
      WHERE client_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `, [client.client_id]);

    const stages = project ? query(`
      SELECT stage_name, stage_code, order_index, status, weight_percent
      FROM project_stages 
      WHERE project_id = ? 
      ORDER BY order_index ASC
    `, [project.id]) : [];

    const activeBriefing = get(`
      SELECT id, type, status, progress_percent 
      FROM briefings 
      WHERE client_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `, [client.client_id]);

    const activeProposal = get(`
      SELECT id, proposal_code, title, status, valid_until, total_value 
      FROM proposals 
      WHERE client_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `, [client.client_id]);

    const previewSite = project ? get(`
      SELECT p.preview_token 
      FROM websites w 
      JOIN previews p ON p.website_id = w.id 
      WHERE w.project_id = ? 
      LIMIT 1
    `, [project.id]) : null;

    res.json({
      client: {
        code: client.client_code,
        companyName: client.company_name,
        city: client.city,
      },
      project,
      stages,
      activeBriefing,
      activeProposal,
      previewUrl: previewSite ? `/api/sites/preview/${previewSite.preview_token}` : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Client Briefing
portalRouter.get('/:token/briefing', (req, res) => {
  try {
    const client = validateClientToken(req.params.token);
    if (!client) return res.status(401).json({ error: 'Acesso não autorizado.' });

    let briefing = get('SELECT * FROM briefings WHERE client_id = ? ORDER BY created_at DESC LIMIT 1', [client.client_id]);
    if (!briefing) {
      // Auto-create initial production briefing for the client
      const id = `brf_${crypto.randomBytes(6).toString('hex')}`;
      run(
        `INSERT INTO briefings (id, client_id, type, status, progress_percent, answers_json, created_at)
         VALUES (?, ?, 'production', 'in_progress', 0, '{}', CURRENT_TIMESTAMP)`,
        [id, client.client_id]
      );
      briefing = get('SELECT * FROM briefings WHERE id = ?', [id]);
    }

    res.json({
      briefing,
      answers: JSON.parse(briefing.answers_json || '{}'),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Client Proposal View & Acceptance
portalRouter.get('/:token/proposal', (req, res) => {
  try {
    const client = validateClientToken(req.params.token);
    if (!client) return res.status(401).json({ error: 'Acesso não autorizado.' });

    const proposal = get('SELECT * FROM proposals WHERE client_id = ? ORDER BY created_at DESC LIMIT 1', [client.client_id]);
    if (!proposal) {
      return res.status(404).json({ error: 'Nenhuma proposta disponível para este projeto.' });
    }

    const acceptance = get('SELECT * FROM proposal_acceptances WHERE proposal_id = ?', [proposal.id]);

    res.json({
      proposal: {
        id: proposal.id,
        code: proposal.proposal_code,
        title: proposal.title,
        status: proposal.status,
        validUntil: proposal.valid_until,
        totalValue: proposal.total_value,
        sections: JSON.parse(proposal.content_json || '[]'),
      },
      acceptance: acceptance ? {
        acceptedByName: acceptance.accepted_by_name,
        acceptedAt: acceptance.accepted_at,
        signatureHash: acceptance.signature_hash,
      } : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept Proposal with SHA-256 Audit Signature
portalRouter.post('/:token/proposal/accept', async (req, res) => {
  try {
    const client = validateClientToken(req.params.token);
    if (!client) return res.status(401).json({ error: 'Acesso não autorizado.' });

    const { proposalId, acceptedByName, acceptedByEmail } = req.body;
    if (!acceptedByName || !acceptedByEmail) {
      return res.status(400).json({ error: 'Nome e e-mail do responsável são obrigatórios para aceite formal.' });
    }

    const proposal = get('SELECT * FROM proposals WHERE id = ? AND client_id = ?', [proposalId, client.client_id]);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada.' });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const timestamp = new Date().toISOString();
    const signatureHash = createDigitalSignatureHash(proposal.proposal_code, acceptedByName, ip, timestamp);
    const acceptanceId = `acc_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      // 1. Record Acceptance
      run(
        `INSERT INTO proposal_acceptances (
          id, proposal_id, client_id, accepted_by_name, accepted_by_email, accepted_ip, 
          user_agent, terms_accepted, signature_hash, accepted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)`,
        [
          acceptanceId,
          proposal.id,
          client.client_id,
          acceptedByName,
          acceptedByEmail,
          ip,
          req.headers['user-agent'] || 'unknown',
          signatureHash,
        ]
      );

      // 2. Update Proposal Status
      run("UPDATE proposals SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [proposal.id]);

      // 3. Update Client Contracted
      run(
        'UPDATE clients SET total_contracted = total_contracted + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [proposal.total_value, client.client_id]
      );

      // 4. Create Notification
      run(
        `INSERT INTO notifications (id, title, message, category, type, link, is_read, created_at)
         VALUES (?, ?, ?, 'proposals', 'success', ?, 0, CURRENT_TIMESTAMP)`,
        [
          `notif_${crypto.randomBytes(6).toString('hex')}`,
          'Proposta Aprovada pelo Cliente! 🎉',
          `${acceptedByName} aprovou formalmente a proposta ${proposal.proposal_code} da empresa ${client.company_name}.`,
          `/proposals/${proposal.id}`,
        ]
      );
    });

    // Fire Automation Engine Event
    await dispatchAutomationEvent({
      event: 'PROPOSAL_ACCEPTED',
      payload: {
        proposalId: proposal.id,
        clientId: client.client_id,
        companyName: client.company_name,
        acceptedByName,
        totalValue: proposal.total_value,
      },
    });

    res.json({
      success: true,
      signatureHash,
      acceptedAt: timestamp,
      message: 'Proposta aceita e registrada com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Client Materials Checklist
portalRouter.get('/:token/materials', (req, res) => {
  try {
    const client = validateClientToken(req.params.token);
    if (!client) return res.status(401).json({ error: 'Acesso não autorizado.' });

    const materials = query(`
      SELECT m.*, f.original_name as file_name, f.file_path
      FROM material_requirements m
      LEFT JOIN files f ON m.file_id = f.id
      JOIN clients c ON c.id = ?
      ORDER BY m.is_mandatory DESC, m.created_at ASC
    `, [client.client_id]);

    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Client File Upload
portalRouter.post('/:token/upload', upload.single('file'), (req, res) => {
  try {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const client = validateClientToken(token as string);
    if (!client) return res.status(401).json({ error: 'Acesso não autorizado.' });

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { materialId, category } = req.body;
    const fileId = `file_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      run(
        `INSERT INTO files (
          id, client_id, filename, original_name, mime_type, file_size, file_path, category, status, uploaded_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', 'client', CURRENT_TIMESTAMP)`,
        [
          fileId,
          client.client_id,
          file.filename,
          file.originalname,
          file.mimetype,
          file.size,
          `/uploads/${file.filename}`,
          category || 'material',
        ]
      );

      // Link to material requirement if provided
      if (materialId) {
        run(
          "UPDATE material_requirements SET file_id = ?, status = 'submitted' WHERE id = ?",
          [fileId, materialId]
        );
      }
    });

    res.json({
      success: true,
      fileId,
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      message: 'Arquivo enviado com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
