import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { FinancialSummary } from '../../server/src/services/financialService';
import { NavigationModule } from '../components/Sidebar';

interface InvoiceItem {
  id: string;
  invoice_number: string;
  client_code: string;
  company_name: string;
  amount: number;
  due_date: string;
  status: string;
  payment_method: string;
}

interface FinancialPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const FinancialPage: React.FC<FinancialPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isRegisteringPayment, setIsRegisteringPayment] = useState(false);

  // Payment form
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [sumRes, invRes] = await Promise.all([
        fetch('/api/financial/summary').then((r) => r.json()),
        fetch('/api/financial/invoices').then((r) => r.json()),
      ]);
      setSummary(sumRes);
      setInvoices(invRes);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    try {
      const res = await fetch('/api/financial/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId || null,
          clientId: inv ? (inv as any).client_id : 'cli_manual',
          amount: Number(paymentAmount),
          paymentMethod,
          notes: paymentNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRegisteringPayment(false);
        fetchFinancialData();
      }
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err);
    }
  };

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-foreground mb-3">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            Fluxo de Caixa & Conciliação
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Gestão <span className="font-serif italic font-normal text-muted-foreground">Financeira</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-sans">
            Faturamento contratado, conciliação manual de recebimentos PIX/Cartão e controle de inadimplência da agência.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/financial/export-csv"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>Exportar CSV</span>
          </a>

          <button
            onClick={() => setIsRegisteringPayment(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar Pagamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-foreground/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Faturamento Contratado
            </span>
            <span className="font-mono text-xs font-black text-muted-foreground">
              01.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-foreground mt-3 block tracking-tight">
            {summary ? formatBRL(summary.totalContracted) : '—'}
          </span>
          <span className="text-[11px] text-muted-foreground mt-2 block font-sans">
            Total global em contratos fechados
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Valores Recebidos
            </span>
            <span className="font-mono text-xs font-black text-emerald-600">
              02.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-3 block tracking-tight">
            {summary ? formatBRL(summary.totalReceived) : '—'}
          </span>
          <span className="text-[11px] text-emerald-700 mt-2 block font-sans">
            Conciliados em conta (PIX/Cartão)
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Saldos a Receber
            </span>
            <span className="font-mono text-xs font-black text-amber-600">
              03.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 mt-3 block tracking-tight">
            {summary ? formatBRL(summary.totalPending) : '—'}
          </span>
          <span className="text-[11px] text-muted-foreground mt-2 block font-sans">
            Parcelas futuras de entrega
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-foreground/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Receita Recorrente (MRR)
            </span>
            <span className="font-mono text-xs font-black text-foreground">
              04.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-foreground mt-3 block tracking-tight">
            {summary ? formatBRL(summary.recurringMonthlyRevenue) : '—'}
          </span>
          <span className="text-[11px] text-muted-foreground mt-2 block font-sans">
            Planos mensais de manutenção
          </span>
        </div>
      </div>

      {/* Payment Modal */}
      {isRegisteringPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <h3 className="font-black text-sm text-foreground uppercase tracking-tight">
                  Registrar Pagamento Manual
                </h3>
              </div>
              <button
                onClick={() => setIsRegisteringPayment(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Vincular a Fatura (Opcional)
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.amount);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground font-sans"
                >
                  <option value="">Nenhuma / Pagamento Avulso</option>
                  {invoices.filter((i) => i.status !== 'paid').map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} — {inv.company_name} ({formatBRL(inv.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Valor Recebido (R$) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-mono focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Método de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground font-sans"
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="transferencia">Transferência Bancária (TED/DOC)</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Observações / Identificação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entrada 50% confirmada no extrato"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground font-sans placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRegisteringPayment(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs rounded-xl bg-primary text-black font-black uppercase tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices Table (3-dot chrome frame) */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 px-6 border-b border-border bg-secondary/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-foreground font-semibold">
              Faturas & Parcelas Emitidas
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{invoices.length} faturas registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Fatura</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Empresa</th>
                <th className="p-4 font-mono">Valor</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Método</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="p-4 font-mono font-bold text-foreground">
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-xs">{inv.invoice_number}</span>
                  </td>
                  <td className="p-4 text-muted-foreground font-mono">{inv.client_code}</td>
                  <td className="p-4 font-bold text-foreground uppercase tracking-tight">
                    {inv.company_name}
                  </td>
                  <td className="p-4 font-mono font-bold text-foreground text-sm">{formatBRL(inv.amount)}</td>
                  <td className="p-4 text-muted-foreground font-mono">{inv.due_date}</td>
                  <td className="p-4 text-muted-foreground uppercase font-mono text-[11px]">{inv.payment_method}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : inv.status === 'overdue'
                          ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Pago' : inv.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="p-16 text-center space-y-3 bg-card">
            <Building className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <h4 className="font-black text-sm text-foreground uppercase">Nenhuma fatura emitida ainda</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
              Faturas são criadas automaticamente na aprovação de propostas ou manualmente pelo botão superior.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
