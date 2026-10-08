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
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-foreground mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Protótipos Rápidos de Venda
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Gerador de Sites <span className="font-serif italic font-normal text-muted-foreground">Demonstrativos</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-sans">
            Crie uma demonstração visual do site em segundos para apresentar ao lead e acelerar o fechamento do contrato.
          </p>
        </div>

        {activePreviewToken && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => copyShareableLink(activePreviewToken)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-secondary/60 border border-border text-foreground text-xs font-semibold transition-all shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              <span>{copied ? 'Link Copiado!' : 'Copiar Link de Apresentação'}</span>
            </button>

            <a
              href={`/api/sites/preview/${activePreviewToken}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Abrir em Nova Aba</span>
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Generator Form & List (1 col) */}
        <div className="space-y-6">
          {/* Generator Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Nova Demonstração</span>
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">01. Configuração</span>
            </div>

            <form onSubmit={handleGenerateSite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Odontologia"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nicho / Especialidade *</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value="odontologia">Odontologia & Estética Dental</option>
                  <option value="barbearia">Barbearia & Estilo Masculino</option>
                  <option value="restaurante">Gastronomia & Bistrô</option>
                  <option value="advocacia">Advocacia & Assessoria Jurídica</option>
                  <option value="geral">Serviços Premium Gerais</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Cidade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-mono focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Endereço (Opcional)</label>
                <input
                  type="text"
                  placeholder="Av. Paulista, 1000"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 mt-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Criando Site...' : 'Gerar Demonstração Grátis'}</span>
              </button>
            </form>
          </div>

          {/* Demos List */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Demonstrações Salvas</span>
              <span className="font-mono text-xs">{sites.length}</span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sites.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActivePreviewToken(s.preview_token)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-xs transition-all ${
                    activePreviewToken === s.preview_token
                      ? 'border-foreground bg-secondary/80 font-semibold shadow-xs'
                      : 'border-border bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-foreground truncate pr-2">{s.name}</h5>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                      {s.template_id}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    {s.city} • {s.views_count} visualizações
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Viewport Switcher & Responsive Preview Canvas (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border flex flex-col shadow-sm overflow-hidden h-[750px]">
          {/* Viewport Control Bar with Mac dots */}
          <div className="p-3.5 border-b border-border bg-secondary/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>

              <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewportMode === 'desktop' ? 'bg-primary text-black font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Computador</span>
                </button>
                <button
                  onClick={() => setViewportMode('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewportMode === 'tablet' ? 'bg-primary text-black font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewportMode === 'mobile' ? 'bg-primary text-black font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Celular</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-background border border-border px-3 py-1 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulador em Tempo Real</span>
            </div>
          </div>

          {/* Iframe Canvas Container */}
          <div className="flex-1 bg-secondary/20 p-6 flex items-center justify-center overflow-auto custom-scrollbar">
            {activePreviewToken ? (
              <div
                className={`h-full bg-white rounded-xl border border-border shadow-xl overflow-hidden transition-all duration-300 ${
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
              <div className="text-center text-xs text-muted-foreground max-w-sm space-y-2">
                <Globe2 className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                <p className="font-semibold text-foreground">Nenhuma demonstração selecionada</p>
                <p>Preencha os dados da empresa à esquerda e clique em <strong>Gerar Demonstração Grátis</strong> para visualizar o site aqui.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
