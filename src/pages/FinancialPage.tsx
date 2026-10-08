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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-primary mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            Fluxo de Caixa & Conciliação
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Gestão <span className="font-serif italic font-normal text-primary">Financeira</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Faturamento contratado, conciliação manual de recebimentos PIX/Cartão e controle de inadimplência.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/financial/export-csv"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4 text-neutral-400" />
            <span>Exportar CSV</span>
          </a>

          <button
            onClick={() => setIsRegisteringPayment(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar Pagamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Faturamento Contratado
            </span>
            <span className="font-mono text-xs font-black text-primary/40 group-hover:text-primary transition-colors">
              01.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-3 block tracking-tight">
            {summary ? formatBRL(summary.totalContracted) : '—'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-2 block font-sans">
            Total global em contratos fechados
          </span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Valores Recebidos
            </span>
            <span className="font-mono text-xs font-black text-emerald-500/40 group-hover:text-emerald-400 transition-colors">
              02.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-3 block tracking-tight">
            {summary ? formatBRL(summary.totalReceived) : '—'}
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-2 block font-sans">
            Conciliados em conta (PIX/Cartão)
          </span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Saldos a Receber
            </span>
            <span className="font-mono text-xs font-black text-amber-500/40 group-hover:text-amber-400 transition-colors">
              03.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-3 block tracking-tight">
            {summary ? formatBRL(summary.totalPending) : '—'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-2 block font-sans">
            Parcelas futuras de entrega
          </span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Receita Recorrente (MRR)
            </span>
            <span className="font-mono text-xs font-black text-primary/40 group-hover:text-primary transition-colors">
              04.
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-primary mt-3 block tracking-tight">
            {summary ? formatBRL(summary.recurringMonthlyRevenue) : '—'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-2 block font-sans">
            Planos mensais de manutenção
          </span>
        </div>
      </div>

      {/* Payment Modal */}
      {isRegisteringPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-white/15 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">
                  Registrar Pagamento Manual
                </h3>
              </div>
              <button
                onClick={() => setIsRegisteringPayment(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                  Vincular a Fatura (Opcional)
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.amount);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:border-primary font-sans"
                >
                  <option value="" className="bg-[#0c0d12]">Nenhuma / Pagamento Avulso</option>
                  {invoices.filter((i) => i.status !== 'paid').map((inv) => (
                    <option key={inv.id} value={inv.id} className="bg-[#0c0d12]">
                      {inv.invoice_number} — {inv.company_name} ({formatBRL(inv.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                  Valor Recebido (R$) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                  Método de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:border-primary font-sans"
                >
                  <option value="pix" className="bg-[#0c0d12]">PIX Instantâneo</option>
                  <option value="cartao" className="bg-[#0c0d12]">Cartão de Crédito</option>
                  <option value="transferencia" className="bg-[#0c0d12]">Transferência Bancária (TED/DOC)</option>
                  <option value="boleto" className="bg-[#0c0d12]">Boleto Bancário</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                  Observações / Comprovante
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entrada 50% confirmada no app do banco"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:border-primary font-sans placeholder:text-neutral-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRegisteringPayment(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-white/5 text-neutral-300 hover:bg-white/10"
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
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-4 px-6 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
              Faturas & Parcelas Emitidas
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">{invoices.length} faturas registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-white/5 font-sans">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 font-mono font-bold text-primary">{inv.invoice_number}</td>
                  <td className="p-4 text-neutral-400 font-mono">{inv.client_code}</td>
                  <td className="p-4 font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                    {inv.company_name}
                  </td>
                  <td className="p-4 font-mono font-bold text-white text-sm">{formatBRL(inv.amount)}</td>
                  <td className="p-4 text-neutral-400 font-mono">{inv.due_date}</td>
                  <td className="p-4 text-neutral-400 uppercase font-mono text-[11px]">{inv.payment_method}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : inv.status === 'overdue'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
          <div className="p-16 text-center space-y-3 bg-white/[0.01]">
            <Building className="w-10 h-10 text-neutral-600 mx-auto" />
            <h4 className="font-black text-sm text-white uppercase">Nenhuma fatura emitida ainda</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
              Faturas são criadas automaticamente na aprovação de propostas ou manualmente pelo botão superior.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
