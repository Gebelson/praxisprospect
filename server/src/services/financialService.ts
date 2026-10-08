import { query, get, run } from '../db/database.js';
import crypto from 'crypto';

export interface FinancialSummary {
  totalContracted: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  averageTicket: number;
  recurringMonthlyRevenue: number;
}

export const getFinancialSummary = (): FinancialSummary => {
  const contractedRes = get('SELECT COALESCE(SUM(total_contracted), 0) as total FROM clients');
  const totalContracted = Number(contractedRes?.total || 0);

  const paymentsRes = get('SELECT COALESCE(SUM(amount), 0) as total FROM payments');
  const totalReceived = Number(paymentsRes?.total || 0);

  const pendingInvoices = get("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'pending'");
  const totalPending = Number(pendingInvoices?.total || 0);

  const overdueInvoices = get("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'overdue'");
  const totalOverdue = Number(overdueInvoices?.total || 0);

  const clientsCountRes = get("SELECT COUNT(*) as cnt FROM clients WHERE total_contracted > 0");
  const clientsWithProjects = Number(clientsCountRes?.cnt || 0);
  const averageTicket = clientsWithProjects > 0 ? totalContracted / clientsWithProjects : 0;

  const recurringRes = get("SELECT COALESCE(SUM(monthly_fee), 0) as total FROM recurring_services WHERE status = 'active'");
  const recurringMonthlyRevenue = Number(recurringRes?.total || 0);

  return {
    totalContracted,
    totalReceived,
    totalPending,
    totalOverdue,
    averageTicket,
    recurringMonthlyRevenue,
  };
};

export const registerPaymentManual = (
  invoiceId: string | null,
  projectId: string | null,
  clientId: string,
  amount: number,
  paymentMethod: string = 'pix',
  notes?: string
): string => {
  const paymentId = `pay_${crypto.randomBytes(6).toString('hex')}`;

  run(
    `INSERT INTO payments (id, invoice_id, project_id, client_id, amount, paid_at, payment_method, notes, created_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP)`,
    [paymentId, invoiceId, projectId, clientId, amount, paymentMethod, notes || null]
  );

  if (invoiceId) {
    run(
      `UPDATE invoices 
       SET status = 'paid' 
       WHERE id = ?`,
      [invoiceId]
    );
  }

  return paymentId;
};

export const exportFinancialCsv = (): string => {
  const invoices = query(`
    SELECT i.invoice_number, c.client_code, comp.name as company_name, i.amount, i.due_date, i.status, i.payment_method
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    JOIN companies comp ON c.company_id = comp.id
    ORDER BY i.due_date DESC
  `);

  const headers = ['Fatura', 'Código Cliente', 'Empresa', 'Valor (R$)', 'Vencimento', 'Status', 'Forma de Pagamento'];
  const rows = invoices.map((inv: any) => [
    inv.invoice_number,
    inv.client_code,
    `"${inv.company_name.replace(/"/g, '""')}"`,
    inv.amount.toFixed(2),
    inv.due_date,
    inv.status,
    inv.payment_method,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
