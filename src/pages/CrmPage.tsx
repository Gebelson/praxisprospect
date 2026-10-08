import React, { useState, useEffect } from 'react';
import {
  Users2,
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Plus,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface LeadItem {
  id: string;
  company_id: string;
  stage_id: string;
  niche: string;
  source: string;
  score: number;
  score_priority: string;
  potential_value: number;
  company_name: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  stage_name: string;
  stage_code: string;
  stage_color: string;
}

interface CrmPageProps {
  onNavigate: (module: NavigationModule) => void;
  onSelectLeadForSite?: (lead: LeadItem) => void;
}

export const CrmPage: React.FC<CrmPageProps> = ({ onNavigate, onSelectLeadForSite }) => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadDetail, setLeadDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrmData();
  }, []);

  const fetchCrmData = async () => {
    try {
      setLoading(true);
      const [leadsRes, stagesRes] = await Promise.all([
        fetch('/api/leads').then((r) => r.json()),
        fetch('/api/dashboard/funnel').then((r) => r.json()),
      ]);
      setLeads(leadsRes);
      setStages(stagesRes);
    } catch (err) {
      console.error('Erro ao carregar CRM:', err);
    } finally {
      setLoading(false);
    }
  };

  const openLeadDetail = async (id: string) => {
    setSelectedLeadId(id);
    try {
      const res = await fetch(`/api/leads/${id}`).then((r) => r.json());
      setLeadDetail(res);
    } catch (err) {
      console.error('Erro ao carregar detalhe do lead:', err);
    }
  };

  const handleStageChange = async (leadId: string, newStageId: string) => {
    try {
      await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: newStageId }),
      });
      fetchCrmData();
      if (selectedLeadId === leadId) {
        openLeadDetail(leadId);
      }
    } catch (err) {
      console.error('Erro ao mover lead:', err);
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Lead convertido com sucesso em Cliente!\nCódigo: ${data.clientCode}\nLink do Portal: ${data.portalUrl}`);
        fetchCrmData();
        openLeadDetail(leadId);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              FUNIL DE VENDAS
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase mt-1">
            CRM & PIPELINE <span className="font-serif italic font-normal text-primary">de oportunidades</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Acompanhamento das oportunidades desde a descoberta até o fechamento contratual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-white/40" />
            <input
              type="text"
              placeholder="Filtrar por nome, nicho, cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:border-primary w-64 transition-all"
            />
          </div>

          {/* Toggle View */}
          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'kanban' ? 'bg-primary text-black font-bold shadow-xs' : 'text-white/50 hover:text-white'
              }`}
              title="Visualização Kanban"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-primary text-black font-bold shadow-xs' : 'text-white/50 hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[550px] custom-scrollbar">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage_id === stage.id);
            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col max-h-[75vh] backdrop-blur-md"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-black uppercase text-white truncate font-sans">{stage.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => openLeadDetail(lead.id)}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors leading-snug">
                          {lead.company_name}
                        </h4>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                            lead.score >= 80
                              ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                              : lead.score >= 60
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-white/5 text-white/50 border border-white/10'
                          }`}
                        >
                          {lead.score} pts
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
                        <span>{lead.city}</span>
                        <span className="capitalize">{lead.niche}</span>
                      </div>

                      {lead.phone && (
                        <div className="text-[10px] text-white/60 flex items-center gap-1.5 font-mono pt-1 border-t border-white/5">
                          <Phone className="w-3 h-3 text-primary" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Empresa</th>
                <th className="p-3.5">Nicho</th>
                <th className="p-3.5">Cidade</th>
                <th className="p-3.5">Telefone</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Etapa Atual</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => openLeadDetail(lead.id)}
                  className="hover:bg-secondary/20 cursor-pointer transition-colors"
                >
                  <td className="p-3.5 font-bold text-foreground">{lead.company_name}</td>
                  <td className="p-3.5 text-muted-foreground capitalize">{lead.niche}</td>
                  <td className="p-3.5 text-muted-foreground">{lead.city}</td>
                  <td className="p-3.5 text-foreground">{lead.phone || '—'}</td>
                  <td className="p-3.5">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-secondary text-foreground">
                      {lead.score} pts
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium inline-block text-foreground border"
                      style={{ borderColor: lead.stage_color, backgroundColor: `${lead.stage_color}15` }}
                    >
                      {lead.stage_name}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLeadDetail(lead.id);
                      }}
                      className="text-primary hover:underline font-semibold"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Detail Slide-Over Drawer */}
      {selectedLeadId && leadDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-start justify-between bg-secondary/20">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {leadDetail.lead.niche}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1.5">{leadDetail.lead.company_name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {leadDetail.lead.city} - {leadDetail.lead.state} | {leadDetail.lead.address || 'Sem endereço'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Fechar
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (onSelectLeadForSite) {
                      onSelectLeadForSite(leadDetail.lead);
                    }
                    onNavigate('sites');
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Site Demonstrativo</span>
                </button>

                <button
                  onClick={() => handleConvertToClient(leadDetail.lead.id)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-all shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Converter em Cliente</span>
                </button>
              </div>

              {/* Stage Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Mover de Etapa no Funil</label>
                <select
                  value={leadDetail.lead.stage_id}
                  onChange={(e) => handleStageChange(leadDetail.lead.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Score Breakdown Section */}
              {leadDetail.score && (
                <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Score Comercial Auditável</span>
                    <span className="text-sm font-bold font-mono text-primary">
                      {leadDetail.score.total_score} / 100 ({leadDetail.score.priority})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{leadDetail.score.explanation}</p>

                  <div className="space-y-2 pt-2 border-t border-border">
                    {leadDetail.score.criteria.map((crit: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5">
                          {crit.status === 'passed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-foreground">{crit.rule}</span>
                        </div>
                        <span className="font-mono text-muted-foreground shrink-0">+{crit.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Channels */}
              <div className="space-y-2 text-xs">
                <h4 className="font-semibold text-foreground">Canais de Contato Verificados</h4>
                <div className="space-y-1.5 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{leadDetail.lead.phone || 'Nenhum telefone público cadastrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{leadDetail.lead.email || 'E-mail não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>{leadDetail.lead.website || 'Sem website oficial'}</span>
                  </div>
                </div>
              </div>

              {/* Activity History */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-foreground">Histórico de Atividades & Auditoria</h4>
                <div className="space-y-2.5">
                  {leadDetail.activities.map((act: any) => (
                    <div key={act.id} className="text-xs border-l-2 border-primary/40 pl-3 py-1 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{act.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(act.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
