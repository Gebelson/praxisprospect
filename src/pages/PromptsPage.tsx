import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  FileCode,
  Image as ImageIcon,
  Layers,
  Terminal,
  Camera,
  Download,
} from 'lucide-react';
import { ImagePromptCard } from '../../server/src/services/promptGeneratorService';
import { NavigationModule } from '../components/Sidebar';

interface PromptsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const PromptsPage: React.FC<PromptsPageProps> = ({ onNavigate }) => {
  const [companyName, setCompanyName] = useState('Clínica Odonto Prime');
  const [niche, setNiche] = useState('Odontologia Especializada');
  const [city, setCity] = useState('Campinas - SP');
  const [colors, setColors] = useState('Azul Marinho (#0F172A) e Dourado (#D97706)');

  const [loading, setLoading] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState<string | null>(null);
  const [pagePrompts, setPagePrompts] = useState<any[]>([]);
  const [imagePrompts, setImagePrompts] = useState<ImagePromptCard[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGeneratePrompts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          niche,
          city,
          briefingAnswers: {
            empresa_historia: 'Clínica odontológica fundada com o propósito de unir tecnologia digital e acolhimento familiar.',
            empresa_diferenciais: 'Equipamentos 3D de precisão, agendamento ágil pelo WhatsApp e atendimento sem dor.',
            empresa_publico: 'Famílias e profissionais que valorizam tratamentos estéticos definitivos de alta durabilidade.',
            servicos_lista: 'Implantes Guiados por Computador\nAlinhadores Ortodônticos Invisíveis\nClareamento a Laser em Sessão Única\nFacetas e Lentes de Contato em Porcelana',
            branding_cores: colors,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMasterPrompt(data.masterPrompt);
        setPagePrompts(data.pagePrompts);
        setImagePrompts(data.imagePrompts);
      }
    } catch (err) {
      console.error('Erro ao gerar prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Engenharia de Prompt Sênior & Direção de Arte
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Gerador de <span className="font-serif italic font-normal text-primary">Prompts & Imagens</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Especificações de software completas para LLMs e fichas de direção fotográfica profissional sem placeholders genéricos.
          </p>
        </div>
      </div>

      {/* Generator Parameter Form (3-dot chrome frame) */}
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
              Parâmetros de Geração do Projeto
            </span>
          </div>
          <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
            LLM COMPILER
          </span>
        </div>

        <form onSubmit={handleGeneratePrompts} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Empresa
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Nicho / Segmento
              </label>
              <input
                type="text"
                required
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Cidade & Estado
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Paleta de Cores
              </label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Compilando Prompts de IA...' : 'Compilar Prompts de Código & Imagens'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Output Sections */}
      {masterPrompt && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 1. Master Software Engineering Prompt */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">
                  Prompt Mestre de Engenharia de Software (Full-Stack Antigravity)
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(masterPrompt, 'master')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                {copiedSection === 'master' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'master' ? 'Copiado!' : 'Copiar Prompt Mestre'}</span>
              </button>
            </div>

            <pre className="p-5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-neutral-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed selection:bg-primary selection:text-black">
              {masterPrompt}
            </pre>
          </div>

          {/* 2. Modular Page Prompts */}
          <div className="space-y-4">
            <h3 className="font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Prompts Modulares por Página</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pagePrompts.map((p, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-3 group hover:border-primary/40 transition-all">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="font-black text-xs text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                      {p.pageName}
                    </h4>
                    <button
                      onClick={() => copyToClipboard(p.prompt, `page_${idx}`)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-primary hover:text-black text-neutral-400 transition-colors"
                      title="Copiar prompt da página"
                    >
                      {copiedSection === `page_${idx}` ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono leading-relaxed max-h-40 overflow-y-auto pr-1">
                    {p.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Image Prompt Cards */}
          <div className="space-y-4">
            <h3 className="font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <span>Fichas de Direção de Arte de Imagens & Fotografia</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {imagePrompts.map((img, idx) => {
                const indexNum = String(idx + 1).padStart(2, '0');
                return (
                  <div key={img.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all group">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-primary">{indexNum}.</span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/10">
                              {img.targetPage} › {img.targetSection}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-white uppercase tracking-tight mt-2 group-hover:text-primary transition-colors">
                            {img.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                          {img.aspectRatio}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 font-sans">{img.purpose}</p>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs font-mono">
                        <span className="text-[10px] text-primary uppercase font-bold block">Prompt Positivo:</span>
                        <p className="text-neutral-300 text-[11px] leading-relaxed">{img.promptText}</p>
                      </div>

                      <div className="text-[10px] text-neutral-400 space-y-1 font-mono pt-1">
                        <div><strong className="text-neutral-300">Estilo:</strong> {img.photographicStyle}</div>
                        <div><strong className="text-neutral-300">Composição:</strong> {img.composition}</div>
                        <div className="text-red-400"><strong className="text-red-400">Negativo:</strong> {img.negativePrompt}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(img.promptText, img.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-black border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      {copiedSection === img.id ? <Check className="w-3.5 h-3.5 text-primary group-hover:text-black" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === img.id ? 'Prompt Copiado!' : 'Copiar Prompt da Imagem'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
