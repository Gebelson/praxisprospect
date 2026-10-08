import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface ProposalItem {
  id: string;
  proposal_code: string;
  title: string;
  status: string;
  valid_until: string;
  total_value: number;
  public_token: string;
  company_name: string;
  created_at: string;
}

interface ProposalsPageProps {
  onNavigate: (module: NavigationModule) => void;
  initialQuoteData?: any;
}

export const ProposalsPage: React.FC<ProposalsPageProps> = ({ onNavigate, initialQuoteData }) => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [proposalDetail, setProposalDetail] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Creation form state
  const [companyName, setCompanyName] = useState('Studio Exemplo Odontologia');
  const [clientName, setClientName] = useState('Dr. Carlos Eduardo');
  const [city, setCity] = useState('São Paulo');
  const [totalValue, setTotalValue] = useState(initialQuoteData?.suggestedPrice || 2400);
  const [estimatedDays, setEstimatedDays] = useState(15);
  const [paymentPlan, setPaymentPlan] = useState('Entrada 50% + Saldo 50% na Entrega');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/proposals');
      const data = await res.json();
      setProposals(data);
      if (data.length > 0 && !selectedProposalId) {
        viewProposal(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar propostas:', err);
    }
  };

  const viewProposal = async (id: string) => {
    setSelectedProposalId(id);
    try {
      const res = await fetch(`/api/proposals/${id}`);
      const data = await res.json();
      setProposalDetail(data);
    } catch (err) {
      console.error('Erro ao abrir proposta:', err);
    }
  };

  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          clientName,
          city,
          totalValue: Number(totalValue),
          estimatedDays: Number(estimatedDays),
          paymentPlan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        fetchProposals();
        viewProposal(data.proposal.id);
      }
    } catch (err) {
      console.error('Erro ao gerar proposta:', err);
    }
  };

  const copyPortalLink = (token: string) => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border border-primary/30 bg-primary/15 text-foreground mb-3">
            <FileCheck2 className="w-3.5 h-3.5 text-primary" />
            Contratos Comerciais & Aceite Digital
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Propostas <span className="font-serif italic font-normal text-muted-foreground">Comerciais</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Documento formal completo com 19 seções jurídicas, cronograma de entregas e link de aceite digital criptografado.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-extrabold uppercase tracking-wider text-xs transition-all shadow-md shadow-primary/25"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Proposta Comercial</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-tight">
                Emitir Nova Proposta Comercial
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateProposal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Nome da Empresa Contratante *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Nome do Responsável Legal *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Cidade / UF *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Prazo Estimado (dias úteis)</label>
                  <input
                    type="number"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    required
                    value={totalValue}
                    onChange={(e) => setTotalValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Condição Comercial</label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => setPaymentPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-sans"
                  >
                    <option value="À Vista com 10% de Desconto">À Vista (-10%)</option>
                    <option value="Entrada 50% + Saldo 50% na Entrega">Entrada 50% + Saldo 50%</option>
                    <option value="Parcelado em 3x Sem Juros">3x Sem Juros</option>
                    <option value="Parcelado em 6x no Cartão">6x no Cartão</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs rounded-xl bg-primary text-black font-extrabold uppercase tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  Gerar Contrato Completo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Layout: List & Active Proposal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Proposal List (1 col) */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Propostas Registradas ({proposals.length})
          </h3>
          {proposals.map((prop) => (
            <div
              key={prop.id}
              onClick={() => viewProposal(prop.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2.5 shadow-sm ${
                selectedProposalId === prop.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">{prop.proposal_code}</span>
                  <h4 className="font-extrabold text-sm text-foreground mt-0.5">{prop.company_name || prop.title}</h4>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                    prop.status === 'accepted'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}
                >
                  {prop.status === 'accepted' ? 'Aprovada' : 'Pendente'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border">
                <span className="font-black font-mono text-foreground text-sm">{formatBRL(prop.total_value)}</span>
                <span className="text-[11px] text-muted-foreground font-sans">Validade: {prop.valid_until}</span>
              </div>
            </div>
          ))}

          {proposals.length === 0 && (
            <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground bg-card">
              Nenhuma proposta gerada ainda. Clique em "Nova Proposta Comercial" acima.
            </div>
          )}
        </div>

        {/* Proposal Reader View (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-7 sm:p-8 shadow-sm flex flex-col justify-between">
          {proposalDetail ? (
            <div className="space-y-6">
              {/* Document Actions Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border gap-3">
                <div>
                  <span className="text-xs font-mono uppercase text-foreground font-bold">
                    {proposalDetail.proposal.proposal_code}
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-0.5">{proposalDetail.proposal.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyPortalLink(proposalDetail.proposal.public_token)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold transition-all shadow-xs"
                    title="Copiar link de acesso para o cliente aprovar"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Link Copiado!' : 'Copiar Link do Cliente'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Digital Acceptance Banner if Accepted */}
              {proposalDetail.acceptances?.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-foreground">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Proposta Aceita Formalmente</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Assinada digitalmente por <strong>{proposalDetail.acceptances[0].accepted_by_name}</strong> em{' '}
                      {new Date(proposalDetail.acceptances[0].accepted_at).toLocaleString('pt-BR')}.
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground mt-1 block truncate">
                      SHA-256 Hash: {proposalDetail.acceptances[0].signature_hash}
                    </span>
                  </div>
                </div>
              )}

              {/* 19 Clauses Scrollable Document */}
              <div className="space-y-6 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                {proposalDetail.sections.map((sec: any) => (
                  <div key={sec.number} className="space-y-1.5 border-b border-border pb-4">
                    <h4 className="font-black text-xs uppercase tracking-wider text-foreground">
                      {sec.number}. {sec.title}
                    </h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed font-sans">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              Selecione uma proposta à esquerda para visualizar suas 19 cláusulas contratuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
