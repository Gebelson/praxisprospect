import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface BriefingItem {
  id: string;
  type: string;
  status: string;
  progress_percent: number;
  client_code: string;
  company_name: string;
  project_name?: string;
  created_at: string;
}

interface BriefingsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const BriefingsPage: React.FC<BriefingsPageProps> = ({ onNavigate }) => {
  const [briefings, setBriefings] = useState<BriefingItem[]>([]);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [briefingDetail, setBriefingDetail] = useState<any | null>(null);

  useEffect(() => {
    fetchBriefings();
  }, []);

  const fetchBriefings = async () => {
    try {
      const res = await fetch('/api/briefings');
      const data = await res.json();
      setBriefings(data);
      if (data.length > 0 && !selectedBriefingId) {
        viewBriefing(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar briefings:', err);
    }
  };

  const viewBriefing = async (id: string) => {
    setSelectedBriefingId(id);
    try {
      const res = await fetch(`/api/briefings/${id}`);
      const data = await res.json();
      setBriefingDetail(data);
    } catch (err) {
      console.error('Erro ao abrir briefing:', err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-foreground mb-3">
            <FileText className="w-3.5 h-3.5 text-primary" />
            Coleta Guiada & Requisitos de Projeto
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Briefings <span className="font-serif italic font-normal text-muted-foreground">Comerciais & Técnicos</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-sans">
            Questionários inteligentes com salvamento automático e validação de escopo para pré-venda e produção.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Briefings List (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Briefings Registrados ({briefings.length})
            </h3>
          </div>

          <div className="space-y-3">
            {briefings.map((b, idx) => {
              const isSelected = selectedBriefingId === b.id;
              const indexNum = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={b.id}
                  onClick={() => viewBriefing(b.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 group relative overflow-hidden ${
                    isSelected
                      ? 'border-foreground bg-secondary/80 shadow-xs'
                      : 'border-border bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-muted-foreground">
                          {indexNum}.
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">
                          {b.client_code} • {b.type === 'commercial' ? 'Pré-Venda' : 'Produção'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-foreground uppercase tracking-tight mt-1">
                        {b.company_name}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                        b.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                          : 'bg-secondary text-muted-foreground border border-border'
                      }`}
                    >
                      {b.status === 'completed' ? '100% CONCLUÍDO' : `${b.progress_percent}%`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${b.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {briefings.length === 0 && (
              <div className="p-12 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground bg-card">
                Nenhum briefing criado ainda. Briefings são gerados na conversão de leads ou abertura de projetos.
              </div>
            )}
          </div>
        </div>

        {/* Briefing Answers Viewer (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          {briefingDetail ? (
            <div className="space-y-6">
              {/* Window Chrome & Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-border gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                      {briefingDetail.briefing.type === 'commercial' ? 'Pré-Venda Comercial' : 'Briefing de Produção'}
                    </span>
                    <h3 className="text-base font-black text-foreground uppercase tracking-tight mt-1">
                      {briefingDetail.briefing.company_name} — Respostas do Cliente
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-black text-foreground px-3 py-1 rounded-full bg-secondary border border-border">
                    {briefingDetail.briefing.progress_percent}% PREENCHIDO
                  </span>
                </div>
              </div>

              {/* Questions & Answers */}
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
                {briefingDetail.questions.map((q: any, qIdx: number) => {
                  const ans = briefingDetail.answers[q.id];
                  const qNum = String(qIdx + 1).padStart(2, '0');

                  return (
                    <div key={q.id} className="p-5 rounded-xl bg-background border border-border space-y-2.5 transition-all">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground bg-primary/20 px-1.5 py-0.5 rounded">{qNum}.</span>
                          <span className="font-bold text-foreground uppercase tracking-tight">{q.label}</span>
                        </div>
                        {ans ? (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> RESPONDIDO
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono italic bg-secondary px-2 py-0.5 rounded-full">
                            PENDENTE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-sans">{q.description}</p>
                      <div className="mt-2 p-3.5 rounded-xl bg-secondary/50 border border-border text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
                        {ans ? (
                          ans === 'already_have' ? '✓ Já possuo o material pronto' :
                          ans === 'need_create' ? '⚡ Preciso que a agência crie' :
                          ans === 'unknown' ? '? Não sei informar' :
                          ans === 'send_later' ? '⏳ Enviarei posteriormente' :
                          ans
                        ) : (
                          <span className="text-muted-foreground italic">Nenhuma resposta registrada pelo cliente ainda.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground space-y-2">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
              <span>Selecione um briefing à esquerda para visualizar as respostas do cliente.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
