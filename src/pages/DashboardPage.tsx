import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  AlertCircle,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Globe2,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface DashboardMetrics {
  leadsFound: number;
  leadsQualified: number;
  leadsContacted: number;
  salesWon: number;
  activeProjects: number;
  delayedProjects: number;
  completedProjects: number;
  proposalsSent: number;
  proposalsAccepted: number;
  contractedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  averageTicket: number;
  conversionRate: number;
  mrr: number;
}

interface FunnelStage {
  id: string;
  name: string;
  code: string;
  order_index: number;
  color: string;
  count: number;
}

interface RecentActivity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
  company_name?: string;
  niche?: string;
}

interface DashboardPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, funnelRes, actRes] = await Promise.all([
        fetch('/api/dashboard/metrics').then((r) => r.json()),
        fetch('/api/dashboard/funnel').then((r) => r.json()),
        fetch('/api/dashboard/recent-activity').then((r) => r.json()),
      ]);
      setMetrics(metricsRes);
      setFunnel(funnelRes);
      setActivities(actRes);
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Quick Action Top Banner (Paleta Titânio & Alabaster do PDF) */}
      <div className="rounded-3xl p-7 sm:p-9 bg-card border border-border shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2.5 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-foreground text-[11px] font-mono tracking-wider uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>OPERAÇÃO DA AGÊNCIA • 100% ATIVA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase font-sans">
            Visão Geral <span className="font-serif italic font-normal text-muted-foreground">do seu negócio</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
            Acompanhe o funil de vendas, contratos fechados e entregas de sites. Tudo centralizado no banco de dados local com custo zero.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={() => onNavigate('prospecting')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-extrabold uppercase tracking-wider text-xs transition-all shadow-md shadow-primary/25 hover:scale-105"
          >
            <Compass className="w-4 h-4 stroke-[2.5]" />
            <span>Encontrar Clientes</span>
          </button>
          <button
            onClick={() => onNavigate('quotes')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Calcular Orçamento</span>
          </button>
        </div>
      </div>

      {/* Guia Rápido: 3 Passos Intuitivos (Estilo '01. Descoberta' do PDF) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigate('prospecting')}
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/60 transition-all cursor-pointer shadow-sm group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-black text-primary">01.</span>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-bold border border-border">
              Prospecção
            </span>
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
            Encontrar Empresas sem Site
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Descubra negócios locais por cidade e nicho comercial que ainda não possuem site oficial cadastrado.
          </p>
          <div className="pt-2 flex items-center text-xs font-bold text-foreground gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Iniciar busca agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('quotes')}
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/60 transition-all cursor-pointer shadow-sm group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-black text-primary">02.</span>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-bold border border-border">
              Precificação
            </span>
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
            Gerar Proposta Comercial
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Calcule o valor ideal por esforço e complexidade com 3 opções de pagamento e contrato com aceite digital.
          </p>
          <div className="pt-2 flex items-center text-xs font-bold text-foreground gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Montar proposta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('sites')}
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/60 transition-all cursor-pointer shadow-sm group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-black text-primary">03.</span>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-bold border border-border">
              Demonstração
            </span>
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
            Apresentar Site Demonstrativo
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gere uma demonstração visual do site personalizada para a empresa antes mesmo de fechar o contrato.
          </p>
          <div className="pt-2 flex items-center text-xs font-bold text-foreground gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Abrir gerador visual</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Cards Brancos Iluminados de Alta Legibilidade) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Leads */}
        <div className="rounded-2xl p-6 bg-card border border-border hover:border-primary/60 shadow-sm transition-all relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Empresas Catalogadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground font-mono">
              {metrics ? metrics.leadsFound : '—'}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {metrics ? `+${metrics.leadsQualified} qualificados` : ''}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans mt-3">
            {metrics?.leadsContacted || 0} já abordados no funil
          </p>
        </div>

        {/* Card 2: Vendas Fechadas */}
        <div className="rounded-2xl p-6 bg-card border border-border hover:border-primary/60 shadow-sm transition-all relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Contratos Fechados
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground font-mono">
              {metrics ? metrics.salesWon : '—'}
            </span>
            <span className="text-xs text-primary font-mono font-extrabold">
              {metrics ? `${metrics.conversionRate.toFixed(1)}% taxa` : ''}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans mt-3">
            Ticket médio: <strong>{metrics ? formatBRL(metrics.averageTicket) : 'R$ 0,00'}</strong>
          </p>
        </div>

        {/* Card 3: Projetos Ativos */}
        <div className="rounded-2xl p-6 bg-card border border-border hover:border-primary/60 shadow-sm transition-all relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Sites em Produção
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-amber-500">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground font-mono">
              {metrics ? metrics.activeProjects : '—'}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {metrics ? `${metrics.completedProjects} finalizados` : ''}
            </span>
          </div>
          <p className="text-[11px] font-sans mt-3">
            {metrics?.delayedProjects ? (
              <span className="text-red-500 font-bold">⚠️ {metrics.delayedProjects} com atraso</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Todos os prazos em dia</span>
            )}
          </p>
        </div>

        {/* Card 4: Faturamento */}
        <div className="rounded-2xl p-6 bg-card border border-border hover:border-primary/60 shadow-sm transition-all relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Faturamento Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground font-mono">
              {metrics ? formatBRL(metrics.contractedRevenue) : '—'}
            </span>
          </div>
          <div className="text-[11px] font-sans text-muted-foreground mt-3 flex justify-between">
            <span>Recebido: <strong className="text-foreground">{metrics ? formatBRL(metrics.receivedRevenue) : 'R$ 0'}</strong></span>
            <span>Pendente: <strong className="text-amber-600 dark:text-amber-400">{metrics ? formatBRL(metrics.pendingRevenue) : 'R$ 0'}</strong></span>
          </div>
        </div>
      </div>

      {/* Middle Section: Funnel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Funnel Column (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl p-7 sm:p-8 bg-card border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                  FLUXO COMERCIAL
                </span>
                <h3 className="text-lg font-black tracking-tight text-foreground uppercase mt-0.5">
                  Funil de Vendas dos Leads
                </h3>
              </div>
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs font-bold text-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <span>Ver CRM Completo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stages Bar Representation */}
            <div className="space-y-4 mt-6">
              {funnel.map((stg, idx) => {
                const maxCount = Math.max(...funnel.map((f) => f.count), 1);
                const percent = Math.round((stg.count / maxCount) * 100);
                return (
                  <div key={stg.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <span className="font-mono text-primary font-black">{`0${idx + 1}.`}</span>
                        <span>{stg.name}</span>
                      </span>
                      <span className="font-mono text-muted-foreground">{stg.count} lead(s)</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-primary"
                        style={{
                          width: `${Math.max(percent, stg.count > 0 ? 8 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Taxa de Conversão: <strong className="text-foreground font-bold">{metrics ? `${metrics.conversionRate.toFixed(1)}%` : '0%'}</strong></span>
            <span>Mensalidades (MRR): <strong className="text-foreground font-bold">{metrics ? formatBRL(metrics.mrr) : 'R$ 0'}</strong></span>
          </div>
        </div>

        {/* Activity Feed Column (1 col) */}
        <div className="rounded-3xl p-7 sm:p-8 bg-card border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                HISTÓRICO RECENTE
              </span>
              <h3 className="text-lg font-black tracking-tight text-foreground uppercase mt-0.5">
                Últimas Atividades
              </h3>
            </div>
            <span className="text-[10px] font-mono text-foreground px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 font-bold">
              Ao Vivo
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground text-center font-sans">
                Nenhuma atividade registrada ainda.
                <br />Comece buscando clientes na aba Encontrar Clientes!
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="text-xs border-l-2 border-primary pl-3.5 py-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground uppercase text-[11px]">{act.title}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(act.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">{act.description}</p>
                  {act.company_name && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] text-foreground font-mono">
                      {act.company_name}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
