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
  ShieldAlert,
  Globe2,
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Quick Action Top Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 relative overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-primary/15 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono tracking-wider uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>OPERAÇÃO AUTÔNOMA DE AGÊNCIA DIGITAL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            VISÃO GERAL <span className="font-serif italic font-normal text-primary">de alta performance</span>
          </h2>
          <p className="text-xs text-white/60 font-sans max-w-xl">
            Central de comando integrada com banco de dados SQLite ACID local. Zero assinaturas, zero custos mensais.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={() => onNavigate('prospecting')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-primary/25 hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Nova Captação</span>
          </button>
          <button
            onClick={() => onNavigate('quotes')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs transition-all hover:border-white/30"
          >
            <DollarSign className="w-4 h-4 text-primary" />
            <span>Simular Orçamento</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Leads */}
        <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">Leads Encontrados</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono group-hover:text-primary transition-colors">
              {metrics ? metrics.leadsFound : '—'}
            </span>
            <span className="text-xs text-primary font-mono font-medium">
              {metrics ? `+${metrics.leadsQualified} qualificados` : ''}
            </span>
          </div>
          <p className="text-[11px] text-white/40 font-mono mt-3">
            {metrics?.leadsContacted || 0} abordados no funil
          </p>
        </div>

        {/* Card 2: Vendas Fechadas */}
        <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">Vendas Fechadas</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono group-hover:text-primary transition-colors">
              {metrics ? metrics.salesWon : '—'}
            </span>
            <span className="text-xs text-primary font-mono font-medium">
              {metrics ? `${metrics.conversionRate.toFixed(1)}% conv.` : ''}
            </span>
          </div>
          <p className="text-[11px] text-white/40 font-mono mt-3">
            Ticket Médio: {metrics ? formatBRL(metrics.averageTicket) : 'R$ 0,00'}
          </p>
        </div>

        {/* Card 3: Projetos Ativos */}
        <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">Projetos em Produção</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono group-hover:text-primary transition-colors">
              {metrics ? metrics.activeProjects : '—'}
            </span>
            <span className="text-xs text-white/50 font-mono">
              {metrics ? `${metrics.completedProjects} entregues` : ''}
            </span>
          </div>
          <p className="text-[11px] text-white/40 font-mono mt-3">
            {metrics?.delayedProjects ? (
              <span className="text-red-400 font-medium">⚠️ {metrics.delayedProjects} com atraso</span>
            ) : (
              <span className="text-primary font-medium">✓ 100% no prazo</span>
            )}
          </p>
        </div>

        {/* Card 4: Faturamento */}
        <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">Faturamento Contratado</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono group-hover:text-primary transition-colors">
              {metrics ? formatBRL(metrics.contractedRevenue) : '—'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-white/50 mt-3 flex justify-between">
            <span className="text-white/70">Recebido: {metrics ? formatBRL(metrics.receivedRevenue) : 'R$ 0'}</span>
            <span className="text-amber-400">Pendente: {metrics ? formatBRL(metrics.pendingRevenue) : 'R$ 0'}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Funnel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Funnel Column (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl p-8 bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  PIPELINE DE VENDAS
                </span>
                <h3 className="text-lg font-black tracking-tight text-white uppercase mt-0.5">
                  Funil Comercial do CRM
                </h3>
              </div>
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1.5"
              >
                <span>Abrir Kanban</span>
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
                      <span className="font-semibold text-white/90 flex items-center gap-2">
                        <span className="font-mono text-primary font-bold">{`0${idx + 1}.`}</span>
                        <span>{stg.name}</span>
                      </span>
                      <span className="font-mono text-white/50">{stg.count} oportunidade(s)</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-primary"
                        style={{
                          width: `${Math.max(percent, stg.count > 0 ? 10 : 0)}%`,
                          boxShadow: stg.count > 0 ? '0 0 10px rgba(212, 255, 0, 0.4)' : 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
            <span>Conversão Global: <strong className="text-primary font-bold">{metrics ? `${metrics.conversionRate.toFixed(1)}%` : '0%'}</strong></span>
            <span>MRR Recorrente: <strong className="text-white font-bold">{metrics ? formatBRL(metrics.mrr) : 'R$ 0'}</strong></span>
          </div>
        </div>

        {/* Activity Feed Column (1 col) */}
        <div className="rounded-3xl p-8 bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                LOG DE OPERAÇÃO
              </span>
              <h3 className="text-lg font-black tracking-tight text-white uppercase mt-0.5">
                Atividades Recentes
              </h3>
            </div>
            <span className="text-[10px] font-mono text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              Tempo Real
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-white/40 text-center font-mono">
                Nenhuma atividade registrada ainda.
                <br />Inicie pesquisando leads na aba Captação!
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="text-xs border-l-2 border-primary/70 pl-3.5 py-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-[11px]">{act.title}</span>
                    <span className="text-[10px] font-mono text-white/40">
                      {new Date(act.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white/60 leading-relaxed text-[11px]">{act.description}</p>
                  {act.company_name && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/80 font-mono">
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
