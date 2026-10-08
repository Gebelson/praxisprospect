import { Router } from 'express';
import { getFinancialSummary, registerPaymentManual, exportFinancialCsv } from '../services/financialService.js';
import { query, get, run } from '../db/database.js';
import crypto from 'crypto';

export const financialRouter = Router();

financialRouter.get('/summary', (req, res) => {
  try {
    const summary = getFinancialSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financialRouter.get('/invoices', (req, res) => {
  try {
    const invoices = query(`
      SELECT 
        i.*,
        c.client_code, comp.name as company_name, p.name as project_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN projects p ON i.project_id = p.id
      ORDER BY i.due_date DESC
    `);
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financialRouter.post('/invoices', (req, res) => {
  try {
    const { clientId, projectId, amount, dueDate, notes, paymentMethod } = req.body;
    if (!clientId || !amount || !dueDate) {
      return res.status(400).json({ error: 'Cliente, valor e vencimento são obrigatórios.' });
    }

    const invoiceNumber = `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceId = `inv_${crypto.randomBytes(6).toString('hex')}`;

    run(
      `INSERT INTO invoices (id, client_id, project_id, invoice_number, amount, due_date, status, payment_method, notes, issued_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, CURRENT_TIMESTAMP)`,
      [invoiceId, clientId, projectId || null, invoiceNumber, amount, dueDate, paymentMethod || 'pix', notes || null]
    );

    res.json({ success: true, invoiceId, invoiceNumber });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financialRouter.post('/payments', (req, res) => {
  try {
    const { invoiceId, projectId, clientId, amount, paymentMethod, notes } = req.body;
    if (!clientId || !amount) {
      return res.status(400).json({ error: 'Cliente e valor são obrigatórios.' });
    }

    const paymentId = registerPaymentManual(
      invoiceId || null,
      projectId || null,
      clientId,
      amount,
      paymentMethod || 'pix',
      notes
    );

    res.json({ success: true, paymentId, message: 'Pagamento registrado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financialRouter.get('/payments', (req, res) => {
  try {
    const payments = query(`
      SELECT 
        p.*,
        c.client_code, comp.name as company_name, i.invoice_number
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      ORDER BY p.paid_at DESC
    `);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financialRouter.get('/export-csv', (req, res) => {
  try {
    const csv = exportFinancialCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=praxis_financeiro.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
