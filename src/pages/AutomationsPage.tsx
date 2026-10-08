import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Power,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  conditions_json: string;
  actions_json: string;
  is_active: number;
  execution_count: number;
  last_triggered_at?: string;
  created_at: string;
}

interface AutomationRunItem {
  id: string;
  automation_name: string;
  trigger_event: string;
  status: string;
  executed_at: string;
  error_message?: string;
}

interface AutomationsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const AutomationsPage: React.FC<AutomationsPageProps> = ({ onNavigate }) => {
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [runs, setRuns] = useState<AutomationRunItem[]>([]);

  useEffect(() => {
    fetchAutomationsData();
  }, []);

  const fetchAutomationsData = async () => {
    try {
      const [autosRes, runsRes] = await Promise.all([
        fetch('/api/automations').then((r) => r.json()),
        fetch('/api/automations/runs').then((r) => r.json()),
      ]);
      setAutomations(autosRes);
      setRuns(runsRes);
    } catch (err) {
      console.error('Erro ao carregar automações:', err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch(`/api/automations/${id}/toggle`, { method: 'PATCH' });
      fetchAutomationsData();
    } catch (err) {
      console.error('Erro ao alternar status da automação:', err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-foreground mb-3">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Motor de Automações & Regras Inteligentes
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Automações da <span className="font-serif italic font-normal text-muted-foreground">Agência</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-sans">
            Gatilhos orientados a eventos para envio de notificações, geração de propostas e avanço de etapas sem intervenção manual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Regras Automatizadas Ativas ({automations.length})
            </h3>
          </div>

          <div className="space-y-4">
            {automations.map((auto, idx) => {
              const actions = JSON.parse(auto.actions_json || '[]');
              const indexNum = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={auto.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 group relative overflow-hidden ${
                    auto.is_active
                      ? 'bg-card border-border shadow-xs hover:border-foreground/40'
                      : 'bg-card/50 border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="font-mono text-xs font-black text-muted-foreground mt-0.5">
                        {indexNum}.
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-sm text-foreground uppercase tracking-tight">
                          {auto.name}
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground block">
                          Gatilho: <strong className="text-foreground">{auto.trigger_event}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(auto.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-xs ${
                        auto.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                          : 'bg-secondary text-muted-foreground border border-border'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{auto.is_active ? 'ATIVA' : 'PAUSADA'}</span>
                    </button>
                  </div>

                  {/* Actions list */}
                  <div className="pt-3 border-t border-border flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-muted-foreground text-[11px] font-mono uppercase">Ações Executadas:</span>
                    {actions.map((act: any, aIdx: number) => (
                      <span key={aIdx} className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground text-[11px] font-mono">
                        {act.action}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground pt-1">
                    <span>Disparos: <strong className="text-foreground">{auto.execution_count}</strong></span>
                    <span>
                      Última execução: {auto.last_triggered_at ? new Date(auto.last_triggered_at).toLocaleString('pt-BR') : 'Nunca'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Runs History (1 col) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-foreground font-semibold">
                  Histórico de Execuções
                </h3>
              </div>
              <button
                onClick={fetchAutomationsData}
                className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                title="Atualizar logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 mt-4 max-h-[500px] pr-1">
              {runs.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-border bg-background space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground uppercase tracking-tight truncate max-w-[160px]">
                      {r.automation_name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.status === 'success'
                          ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-red-600 bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                    <span className="text-foreground font-semibold truncate max-w-[130px]">{r.trigger_event}</span>
                    <span>{new Date(r.executed_at).toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
              ))}

              {runs.length === 0 && (
                <div className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground text-center font-sans">
                  <span>Nenhuma execução registrada no histórico ainda.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
