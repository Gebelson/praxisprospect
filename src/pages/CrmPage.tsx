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
  X,
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
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border border-primary/30 bg-primary/15 text-foreground mb-3">
            <Users2 className="w-3.5 h-3.5 text-primary" />
            Funil de Oportunidades Comerciais
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Funil de Vendas <span className="font-serif italic font-normal text-muted-foreground">(CRM)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            Acompanhe o estágio de cada empresa, qualifique o interesse e converta em cliente com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por empresa, nicho ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-64 transition-all shadow-xs"
            />
          </div>

          {/* Toggle View */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-primary text-black font-extrabold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Visualização em Colunas Kanban"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-primary text-black font-extrabold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Visualização em Lista / Tabela"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-5 overflow-x-auto pb-6 min-h-[550px] custom-scrollbar">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage_id === stage.id);
            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-card border border-border rounded-2xl flex flex-col max-h-[75vh] shadow-sm"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-extrabold uppercase text-foreground truncate font-sans">{stage.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background border border-border text-foreground font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => openLeadDetail(lead.id)}
                      className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-primary/80 hover:bg-card cursor-pointer transition-all space-y-2.5 group shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {lead.company_name}
                        </h4>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                            lead.score >= 80
                              ? 'bg-primary/20 text-foreground border border-primary/30'
                              : lead.score >= 60
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25'
                              : 'bg-background text-muted-foreground border border-border'
                          }`}
                        >
                          {lead.score} pts
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>{lead.city}</span>
                        <span className="capitalize">{lead.niche}</span>
                      </div>

                      {lead.phone && (
                        <div className="text-[11px] text-foreground flex items-center gap-1.5 font-mono pt-1.5 border-t border-border/80">
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                      Nenhum lead nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Empresa</th>
                <th className="p-4">Nicho</th>
                <th className="p-4">Cidade</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Score</th>
                <th className="p-4">Etapa Atual</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => openLeadDetail(lead.id)}
                  className="hover:bg-secondary/30 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-bold text-foreground">{lead.company_name}</td>
                  <td className="p-4 text-muted-foreground capitalize">{lead.niche}</td>
                  <td className="p-4 text-muted-foreground">{lead.city}</td>
                  <td className="p-4 text-foreground font-mono">{lead.phone || '—'}</td>
                  <td className="p-4">
                    <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-foreground text-[11px]">
                      {lead.score} pts
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block text-foreground border"
                      style={{ borderColor: lead.stage_color, backgroundColor: `${lead.stage_color}20` }}
                    >
                      {lead.stage_name}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLeadDetail(lead.id);
                      }}
                      className="text-foreground hover:text-primary font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-start justify-between bg-secondary/30">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/20 text-foreground font-bold border border-primary/30">
                  {leadDetail.lead.niche}
                </span>
                <h3 className="text-lg font-black text-foreground mt-2">{leadDetail.lead.company_name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {leadDetail.lead.city} - {leadDetail.lead.state} | {leadDetail.lead.address || 'Sem endereço'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground"
              >
                <X className="w-4 h-4" />
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
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Site Demonstrativo</span>
                </button>

                <button
                  onClick={() => handleConvertToClient(leadDetail.lead.id)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Converter em Cliente</span>
                </button>
              </div>

              {/* Stage Selector */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Mover de Etapa no Funil</label>
                <select
                  value={leadDetail.lead.stage_id}
                  onChange={(e) => handleStageChange(leadDetail.lead.id, e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-sans"
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
                <div className="bg-secondary/40 border border-border rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Score Comercial Calculado</span>
                    <span className="text-sm font-bold font-mono text-foreground">
                      {leadDetail.score.total_score} / 100 ({leadDetail.score.priority})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{leadDetail.score.explanation}</p>

                  <div className="space-y-2 pt-2 border-t border-border">
                    {leadDetail.score.criteria.map((crit: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5">
                          {crit.status === 'passed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
                <h4 className="font-bold text-foreground">Canais de Contato Verificados</h4>
                <div className="space-y-1.5 text-muted-foreground font-sans">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
