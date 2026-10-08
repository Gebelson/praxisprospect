import { Router } from 'express';
import crypto from 'crypto';
import { generateCompleteProposal, ProposalInput } from '../services/proposalService.js';
import { query, get, run, transaction } from '../db/database.js';

export const proposalsRouter = Router();

proposalsRouter.post('/generate', (req, res) => {
  try {
    const { quoteId, clientId, leadId, input } = req.body;
    if (!input || !input.companyName || !input.totalValue) {
      return res.status(400).json({ error: 'Dados do projeto e valor são obrigatórios.' });
    }

    const proposal = generateCompleteProposal(input);
    const proposalId = `prop_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      run(
        `INSERT INTO proposals (
          id, quote_id, client_id, lead_id, title, proposal_code, public_token, status, 
          version, valid_until, total_value, payment_structure_json, content_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 1, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          proposalId,
          quoteId || null,
          clientId || null,
          leadId || null,
          `Proposta Comercial — ${input.companyName}`,
          proposal.proposalCode,
          proposal.publicToken,
          proposal.validUntil,
          proposal.totalValue,
          JSON.stringify({ plan: input.paymentPlanChosen }),
          JSON.stringify(proposal.sections),
        ]
      );

      // Save version 1 snapshot
      run(
        `INSERT INTO proposal_versions (id, proposal_id, version_number, content_json, total_value, created_at)
         VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `pver_${crypto.randomBytes(6).toString('hex')}`,
          proposalId,
          JSON.stringify(proposal.sections),
          proposal.totalValue,
        ]
      );
    });

    res.json({
      success: true,
      proposalId,
      proposalCode: proposal.proposalCode,
      publicToken: proposal.publicToken,
      publicUrl: `/portal/${proposal.publicToken}/proposal`,
      sections: proposal.sections,
      message: 'Proposta comercial de 19 seções gerada com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

proposalsRouter.get('/', (req, res) => {
  try {
    const proposals = query(`
      SELECT 
        p.*,
        c.name as company_name, cli.client_code
      FROM proposals p
      LEFT JOIN clients cli ON p.client_id = cli.id
      LEFT JOIN companies c ON cli.company_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

proposalsRouter.get('/:id', (req, res) => {
  try {
    const proposal = get('SELECT * FROM proposals WHERE id = ?', [req.params.id]);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada.' });
    }

    const versions = query('SELECT * FROM proposal_versions WHERE proposal_id = ? ORDER BY version_number DESC', [req.params.id]);
    const acceptances = query('SELECT * FROM proposal_acceptances WHERE proposal_id = ?', [req.params.id]);

    res.json({
      proposal,
      sections: JSON.parse(proposal.content_json || '[]'),
      versions,
      acceptances,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

proposalsRouter.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    run('UPDATE proposals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
