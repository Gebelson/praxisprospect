import { Router } from 'express';
import crypto from 'crypto';
import { calculateProjectQuote, PricingInput } from '../services/pricingEngine.js';
import { query, get, run, transaction } from '../db/database.js';

export const quotesRouter = Router();

quotesRouter.post('/calculate', (req, res) => {
  try {
    const input: PricingInput = req.body;
    const result = calculateProjectQuote(input);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

quotesRouter.post('/', (req, res) => {
  try {
    const { leadId, clientId, title, calculationResult } = req.body;
    if (!title || !calculationResult) {
      return res.status(400).json({ error: 'Título e cálculo do orçamento são obrigatórios.' });
    }

    const quoteId = `quote_${crypto.randomBytes(6).toString('hex')}`;

    transaction(() => {
      run(
        `INSERT INTO quotes (
          id, lead_id, client_id, title, project_type, total_suggested, min_price, 
          total_cost, target_margin, urgency_multiplier, payment_terms_json, breakdown_json, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP)`,
        [
          quoteId,
          leadId || null,
          clientId || null,
          title,
          calculationResult.projectType,
          calculationResult.suggestedPrice,
          calculationResult.minPrice,
          calculationResult.internalCost,
          calculationResult.targetMarginPercent,
          calculationResult.urgencyMultiplier,
          JSON.stringify(calculationResult.paymentPlans),
          JSON.stringify(calculationResult.items),
        ]
      );

      for (const item of calculationResult.items) {
        run(
          `INSERT INTO quote_items (
            id, quote_id, description, category, estimated_hours, hourly_rate, unit_price, quantity, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            `item_${crypto.randomBytes(6).toString('hex')}`,
            quoteId,
            item.description,
            item.category,
            item.hours,
            item.hourlyRate,
            item.suggestedValue,
            item.suggestedValue,
          ]
        );
      }
    });

    res.json({ success: true, quoteId, message: 'Orçamento salvo com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

quotesRouter.get('/', (req, res) => {
  try {
    const quotes = query(`
      SELECT 
        q.*,
        c.name as company_name, cli.client_code
      FROM quotes q
      LEFT JOIN leads l ON q.lead_id = l.id
      LEFT JOIN companies c ON l.company_id = c.id
      LEFT JOIN clients cli ON q.client_id = cli.id
      ORDER BY q.created_at DESC
    `);
    res.json(quotes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

quotesRouter.get('/:id', (req, res) => {
  try {
    const quote = get('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    if (!quote) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    const items = query('SELECT * FROM quote_items WHERE quote_id = ?', [req.params.id]);

    res.json({
      quote,
      items,
      paymentPlans: JSON.parse(quote.payment_terms_json || '[]'),
      breakdown: JSON.parse(quote.breakdown_json || '[]'),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
