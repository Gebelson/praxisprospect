import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Compass,
  DollarSign,
  Activity,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface ReportsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then((r) => r.json())
      .then(setMetrics)
      .catch(console.error);
  }, []);

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-foreground mb-3">
            <Activity className="w-3.5 h-3.5 text-primary" />
            Métricas Consolidadas & BI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Relatórios de <span className="font-serif italic font-normal text-muted-foreground">Desempenho</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-sans">
            Estatísticas operacionais em tempo real, taxa de fechamento comercial e ticket médio por segmento da agência.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Taxa de Conversão Global
            </span>
            <span className="font-mono text-xs font-black text-emerald-600">
              01.
            </span>
          </div>
          <span className="text-3xl sm:text-4xl font-black font-mono text-foreground block tracking-tight">
            {metrics ? `${metrics.conversionRate.toFixed(1)}%` : '0%'}
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            De leads qualificados até assinatura contratual e início do projeto.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-foreground/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Ticket Médio de Venda
            </span>
            <span className="font-mono text-xs font-black text-muted-foreground">
              02.
            </span>
          </div>
          <span className="text-3xl sm:text-4xl font-black font-mono text-foreground block tracking-tight">
            {metrics ? formatBRL(metrics.averageTicket) : 'R$ 0,00'}
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            Valor médio contratado por projeto aprovado na agência.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Eficiência de Propostas
            </span>
            <span className="font-mono text-xs font-black text-amber-600">
              03.
            </span>
          </div>
          <span className="text-3xl sm:text-4xl font-black font-mono text-foreground block tracking-tight">
            {metrics && metrics.proposalsSent > 0
              ? `${Math.round((metrics.proposalsAccepted / metrics.proposalsSent) * 100)}%`
              : '100%'}
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            Proporção de propostas comerciais aceitas pelos clientes.
          </p>
        </div>
      </div>

      {/* Origin & Niche Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <h3 className="font-black text-sm text-foreground uppercase tracking-tight">
              Fontes de Captação Mais Eficientes
            </h3>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-foreground/30 transition-all">
              <span className="text-foreground font-medium">OpenStreetMap (Overpass API)</span>
              <span className="font-mono font-bold text-foreground text-sm">75% dos leads</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-foreground/30 transition-all">
              <span className="text-foreground font-medium">Diretórios Locais & Dados Abertos</span>
              <span className="font-mono font-bold text-muted-foreground text-sm">20% dos leads</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-foreground/30 transition-all">
              <span className="text-foreground font-medium">Indicações & Cadastro Direto</span>
              <span className="font-mono font-bold text-muted-foreground text-sm">5% dos leads</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <h3 className="font-black text-sm text-foreground uppercase tracking-tight">
              Top Nichos por Retorno Comercial
            </h3>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-foreground/30 transition-all">
              <span className="text-foreground font-medium">Odontologia & Clínicas Médicas</span>
              <span className="font-mono font-bold text-foreground text-sm">Ticket: R$ 2.800</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-foreground/30 transition-all">
              <span className="text-foreground font-medium">Escritórios de Advocacia & Contábeis</span>
              <span className="font-mono font-bold text-muted-foreground text-sm">Ticket: R$ 3.200</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-foreground/30 transition-all">
              <span className="text-foreground font-medium">Barbearias & Estética Avançada</span>
              <span className="font-mono font-bold text-muted-foreground text-sm">Ticket: R$ 1.800</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
