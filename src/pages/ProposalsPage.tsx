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
          input: {
            clientName,
            companyName,
            city,
            projectTitle: `Desenvolvimento de Website Oficial — ${companyName}`,
            projectType: 'institucional',
            totalValue: Number(totalValue),
            paymentPlanChosen: paymentPlan,
            estimatedDays: Number(estimatedDays),
            scopeItems: ['Design responsivo', 'Otimização SEO', 'Integração WhatsApp'],
            pagesList: ['Início (Home)', 'Sobre a Empresa', 'Especialidades / Serviços', 'Contato & Localização'],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        fetchProposals();
        viewProposal(data.proposalId);
      }
    } catch (err) {
      console.error('Erro ao criar proposta:', err);
    }
  };

  const copyPortalLink = (token: string) => {
    const url = `${window.location.origin}/portal/${token}/proposal`;
    navigator.clipboard.writeText(url);
    alert('Link da proposta para o cliente copiado para a área de transferência!');
  };

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              CONTRATOS & ACORDOS
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase mt-1">
            PROPOSTAS COMERCIAIS <span className="font-serif italic font-normal text-primary">com aceite digital</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Documento contratual formal em 19 cláusulas com assinatura digital auditável por hash SHA-256.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-primary/25 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Proposta Comercial</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-foreground">Gerar Nova Proposta Comercial</h3>
            <form onSubmit={handleGenerateProposal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nome da Empresa Contratante</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nome do Responsável Legal</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Cidade</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Prazo Estimado (dias úteis)</label>
                  <input
                    type="number"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Investimento Total (R$)</label>
                  <input
                    type="number"
                    required
                    value={totalValue}
                    onChange={(e) => setTotalValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Condição de Pagamento</label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => setPaymentPlan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
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
                  className="px-4 py-2 text-xs rounded-lg bg-secondary text-foreground hover:bg-secondary/80"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Gerar 19 Seções
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
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Propostas Geradas</h3>
          {proposals.map((prop) => (
            <div
              key={prop.id}
              onClick={() => viewProposal(prop.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                selectedProposalId === prop.id
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">{prop.proposal_code}</span>
                  <h4 className="font-bold text-sm text-foreground mt-0.5">{prop.company_name || prop.title}</h4>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    prop.status === 'accepted'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {prop.status === 'accepted' ? 'Aprovada' : 'Pendente'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="font-bold font-mono text-primary">{formatBRL(prop.total_value)}</span>
                <span className="text-[11px] text-muted-foreground">Validade: {prop.valid_until}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Proposal Reader View (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 shadow-xs flex flex-col justify-between">
          {proposalDetail ? (
            <div className="space-y-6">
              {/* Document Actions Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border gap-3">
                <div>
                  <span className="text-xs font-mono uppercase text-primary font-bold">
                    {proposalDetail.proposal.proposal_code}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-0.5">{proposalDetail.proposal.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyPortalLink(proposalDetail.proposal.public_token)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-medium"
                    title="Copiar link de acesso para o cliente"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link do Cliente</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Digital Acceptance Banner if Accepted */}
              {proposalDetail.acceptances?.length > 0 && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-foreground">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-500">Proposta Aceita Formalmente</h4>
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
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {proposalDetail.sections.map((sec: any) => (
                  <div key={sec.number} className="space-y-1.5 border-b border-border/50 pb-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                      {sec.number}. {sec.title}
                    </h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              Selecione uma proposta para visualizar suas 19 seções contratuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
