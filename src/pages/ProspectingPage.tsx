import React, { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  Loader2,
  Radar,
  ExternalLink,
} from 'lucide-react';
import { DiscoveredLead } from '../../server/src/services/osmService';
import { NavigationModule } from '../components/Sidebar';

interface ProspectingPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const ProspectingPage: React.FC<ProspectingPageProps> = ({ onNavigate }) => {
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [neighborhood, setNeighborhood] = useState('');
  const [niche, setNiche] = useState('odontologia');
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiscoveredLead[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedMap, setImportedMap] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const NICHES = [
    { id: 'odontologia', label: 'Odontologia / Clínicas Dentárias' },
    { id: 'barbearia', label: 'Barbearias & Salões' },
    { id: 'restaurante', label: 'Restaurantes & Gastronomia' },
    { id: 'advocacia', label: 'Escritórios de Advocacia' },
    { id: 'medicina', label: 'Clínicas Médicas & Consultórios' },
    { id: 'contabilidade', label: 'Contabilidade & Finanças' },
    { id: 'estetica', label: 'Clínicas de Estética & Spas' },
    { id: 'academia', label: 'Academias & Centros Esportivos' },
    { id: 'arquitetura', label: 'Arquitetura & Engenharia' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !niche) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/prospecting/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          state,
          neighborhood,
          niche,
          onlyWithoutWebsite,
        }),
      });

      if (!res.ok) {
        throw new Error(`Falha na pesquisa (${res.status})`);
      }

      const data: DiscoveredLead[] = await res.json();
      setResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar busca de leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportLead = async (lead: DiscoveredLead) => {
    try {
      setImportingId(lead.osmId);
      const res = await fetch('/api/prospecting/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao importar lead.');
      }

      setImportedMap((prev) => ({ ...prev, [lead.osmId]: true }));
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-primary mb-3">
            <Radar className="w-3.5 h-3.5 animate-pulse text-primary" />
            Fontes Abertas & Rastreabilidade LGPD
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Prospecção <span className="font-serif italic font-normal text-primary">Geoespacial</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Varredura territorial autônoma via Overpass API (OpenStreetMap) com auditoria instantânea de maturidade web a custo R$ 0.
          </p>
        </div>
      </div>

      {/* Query Filter Box (Luxury 3-dot window frame) */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest font-semibold">
              Parâmetros de Varredura Territorial
            </span>
          </div>
          <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
            API OVERPASS FREE
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* City */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo, Campinas, Curitiba"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Estado (UF)
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="SP"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase font-mono tracking-wider"
              />
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Bairro (Opcional)
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Centro, Moema, Jardins"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              />
            </div>

            {/* Niche */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Nicho / Categoria *
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              >
                {NICHES.map((n) => (
                  <option key={n.id} value={n.id} className="bg-[#0c0d12] text-white">
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10">
            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyWithoutWebsite}
                onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-primary focus:ring-primary accent-primary w-4 h-4 cursor-pointer"
              />
              <span className="font-sans">Priorizar empresas sem website oficial registrado (Alta conversão)</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Consultando Overpass API...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Executar Varredura</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Header */}
      {results.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
            <Database className="w-4 h-4 text-primary" />
            <span>
              Encontradas <strong className="text-white font-mono text-sm">{results.length}</strong> empresas em {city} ({niche})
            </span>
          </div>
          <button
            onClick={() => onNavigate('crm')}
            className="text-xs text-primary hover:text-white font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Leads no CRM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map((lead, idx) => {
          const isImported = importedMap[lead.osmId];
          const isImporting = importingId === lead.osmId;
          const indexNum = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={lead.osmId}
              className={`bg-white/[0.02] border rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all group relative overflow-hidden ${
                isImported
                  ? 'border-emerald-500/40 bg-emerald-500/[0.03]'
                  : 'border-white/10 hover:border-primary/40 hover:bg-white/[0.04]'
              }`}
            >
              <div className="space-y-4">
                {/* Index tag & status pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-primary/40 group-hover:text-primary transition-colors">
                      {indexNum}.
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                      {lead.niche}
                    </span>
                  </div>

                  {lead.hasWebsite ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium shrink-0 font-mono">
                      Possui Site
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-black shrink-0 font-mono uppercase">
                      Sem Site Oficial
                    </span>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-snug">
                    {lead.name}
                  </h3>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-neutral-400 font-sans">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{lead.address}</span>
                  </div>

                  {lead.phone ? (
                    <div className="flex items-center gap-2 text-neutral-200 font-mono">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-neutral-500 italic text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                      <span>Telefone não catalogado</span>
                    </div>
                  )}

                  {lead.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a
                        href={lead.website.startsWith('http') ? lead.website : `http://${lead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-primary hover:underline text-[11px] font-mono"
                      >
                        {lead.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">
                  {lead.source.includes('Overpass') ? 'OpenStreetMap' : 'Dados Abertos'}
                </span>

                {isImported ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>QUALIFICADO NO CRM</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleImportLead(lead)}
                    disabled={isImporting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-primary hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/10 disabled:opacity-50"
                  >
                    {isImporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-primary group-hover:text-black" />
                    )}
                    <span>Importar & Qualificar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {results.length === 0 && !loading && (
        <div className="p-16 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-white/[0.01]">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-primary">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-base text-white uppercase tracking-tight">
              Inicie uma Varredura Territorial
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 font-sans">
              Selecione uma cidade e nicho comercial acima para buscar potenciais clientes sem website diretamente na malha de dados abertos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

