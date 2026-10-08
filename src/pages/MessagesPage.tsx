import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Send,
  Check,
  Phone,
  Mail,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface MessageTemplate {
  id: string;
  name: string;
  channel: string;
  category: string;
  template_text: string;
  variables_json: string;
}

interface MessagesPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigate }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Variables
  const [empresa, setEmpresa] = useState('Clínica Odonto Sorriso');
  const [cidade, setCidade] = useState('São Paulo');
  const [nicho, setNicho] = useState('Odontologia');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [instagram, setInstagram] = useState('odontosorriso');
  const [email, setEmail] = useState('contato@odontosorriso.com.br');
  const [demoLink, setDemoLink] = useState('https://praxis.local/demo/exemplo');

  const [renderedText, setRenderedText] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      renderCurrentTemplate();
    }
  }, [selectedTemplateId, empresa, cidade, nicho, phone, instagram, email, demoLink]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/messages/templates');
      const data = await res.json();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  };

  const renderCurrentTemplate = async () => {
    try {
      const res = await fetch('/api/messages/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          variables: {
            empresa,
            cidade,
            nicho,
            agencia_responsavel: 'Equipe Praxis Studio',
            link_demo: demoLink,
            link_proposta: demoLink,
            link_briefing: demoLink,
            instagram,
            nome_contato: 'Dr(a). Responsável',
            agencia_nome: 'Praxis Digital Studio',
          },
          phone,
          email,
          instagram,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRenderedText(data.renderedText);
        setWhatsappUrl(data.whatsappUrl);
        setInstagramUrl(data.instagramUrl);
        setMailtoUrl(data.mailtoUrl);
      }
    } catch (err) {
      console.error('Erro ao renderizar template:', err);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(renderedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recordMessageSent = async (channel: string) => {
    try {
      const res = await fetch('/api/messages/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          content: renderedText,
          status: 'sent',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLoggedSuccess(true);
        setTimeout(() => setLoggedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao registrar mensagem:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            PROSPECÇÃO ATIVA
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase mt-1">
          SCRIPTS DE ABORDAGEM <span className="font-serif italic font-normal text-primary">multicanal de alta conversão</span>
        </h2>
        <p className="text-xs text-white/50 mt-0.5">
          Geração de mensagens comerciais personalizadas com links diretos para WhatsApp, Instagram e E-mail sem APIs pagas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template & Variables Box (1 col) */}
        <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-white/70 font-mono">Configuração da Mensagem</h3>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Modelo de Mensagem</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  [{tpl.channel.toUpperCase()}] {tpl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground block">Variáveis do Lead</span>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Empresa</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Nicho</label>
                <input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Telefone WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Instagram (@)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Link da Demonstração</label>
              <input
                type="text"
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Preview & 1-Click Launch Buttons (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">Prévia da Mensagem Gerada</h3>
              <button
                onClick={copyText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-xs text-foreground font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={renderedText}
              rows={12}
              className="w-full p-4 rounded-lg bg-background border border-border text-xs font-sans text-foreground leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => recordMessageSent('whatsapp')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Abrir no WhatsApp Web</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    copyText();
                    recordMessageSent('instagram');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition-all shadow-xs"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Copiar e Abrir Instagram</span>
                </a>
              )}

              {mailtoUrl && (
                <a
                  href={mailtoUrl}
                  onClick={() => recordMessageSent('email')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar por E-mail</span>
                </a>
              )}
            </div>

            <button
              onClick={() => recordMessageSent('manual')}
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
            >
              {loggedSuccess ? '✓ Registrado no CRM!' : 'Registrar Envio no CRM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
