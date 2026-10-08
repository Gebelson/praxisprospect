import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Copy,
  Sparkles,
  Layers,
  ShieldAlert,
  Loader2,
  Check,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface SiteItem {
  id: string;
  name: string;
  niche: string;
  template_id: string;
  preview_token: string;
  views_count: number;
  company_name: string;
  city: string;
  created_at: string;
}

interface SitesPageProps {
  onNavigate: (module: NavigationModule) => void;
  preSelectedLead?: any;
}

export const SitesPage: React.FC<SitesPageProps> = ({ onNavigate, preSelectedLead }) => {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [activePreviewToken, setActivePreviewToken] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generator form
  const [companyName, setCompanyName] = useState(preSelectedLead?.company_name || 'Clínica Odonto Prime');
  const [niche, setNiche] = useState(preSelectedLead?.niche || 'odontologia');
  const [city, setCity] = useState(preSelectedLead?.city || 'São Paulo');
  const [phone, setPhone] = useState(preSelectedLead?.phone || '(11) 98765-4321');
  const [address, setAddress] = useState(preSelectedLead?.address || 'Av. Paulista, 1000 - Bela Vista');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      setSites(data);
      if (data.length > 0 && !activePreviewToken) {
        setActivePreviewToken(data[0].preview_token);
      }
    } catch (err) {
      console.error('Erro ao carregar sites:', err);
    }
  };

  const handleGenerateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const res = await fetch('/api/sites/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: preSelectedLead?.id,
          companyName,
          niche,
          city,
          phone,
          address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSites();
        setActivePreviewToken(data.previewToken);
      }
    } catch (err) {
      console.error('Erro ao gerar demonstração:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareableLink = (token: string) => {
    const url = `${window.location.origin}/api/sites/preview/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              PROTÓTIPOS DE VENDAS
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase mt-1">
            GERADOR DE SITES <span className="font-serif italic font-normal text-primary">demonstrativos</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Criação de páginas conceituais personalizadas para encantar o lead antes da assinatura.
          </p>
        </div>

        {activePreviewToken && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyShareableLink(activePreviewToken)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <a
              href={`/api/sites/preview/${activePreviewToken}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-primary/25 hover:scale-105"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir em Nova Aba</span>
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Generator Form & List (1 col) */}
        <div className="space-y-6">
          {/* Generator Form */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Nova Demonstração</span>
            </h3>

            <form onSubmit={handleGenerateSite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Empresa</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nicho / Tema</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="odontologia">Odontologia & Estética Dental</option>
                  <option value="barbearia">Barbearia & Estilo Masculino</option>
                  <option value="restaurante">Gastronomia & Bistrô</option>
                  <option value="advocacia">Advocacia & Assessoria Jurídica</option>
                  <option value="geral">Serviços Premium Gerais</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Compilando Site...' : 'Gerar Demonstração'}</span>
              </button>
            </form>
          </div>

          {/* Demos List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Demonstrações Criadas</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sites.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActivePreviewToken(s.preview_token)}
                  className={`p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                    activePreviewToken === s.preview_token
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-foreground">{s.name}</h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                      {s.template_id}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    {s.city} | {s.views_count} visualizações
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Viewport Switcher & Responsive Preview Canvas (3 cols) */}
        <div className="lg:col-span-3 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col shadow-2xl overflow-hidden h-[750px] backdrop-blur-xl">
          {/* Viewport Control Bar with 3 dots */}
          <div className="p-3.5 border-b border-white/10 bg-black/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>

              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 ml-2">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewportMode === 'desktop' ? 'bg-primary text-black font-bold shadow-xs' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setViewportMode('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewportMode === 'tablet' ? 'bg-primary text-black font-bold shadow-xs' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewportMode === 'mobile' ? 'bg-primary text-black font-bold shadow-xs' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Aviso de Demonstração Não Oficial Ativo</span>
            </div>
          </div>

          {/* Iframe Canvas Container */}
          <div className="flex-1 bg-black/40 p-4 flex items-center justify-center overflow-auto custom-scrollbar">
            {activePreviewToken ? (
              <div
                className={`h-full bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ${
                  viewportMode === 'desktop'
                    ? 'w-full'
                    : viewportMode === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
                }`}
              >
                <iframe
                  src={`/api/sites/preview/${activePreviewToken}`}
                  title="Website Demo Preview"
                  className="w-full h-full border-none"
                />
              </div>
            ) : (
              <div className="text-center text-xs font-mono text-white/40">
                Selecione ou gere uma demonstração de site para visualizar no simulador responsivo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
