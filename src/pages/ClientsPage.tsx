import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  ExternalLink,
  Copy,
  RefreshCw,
  FolderGit2,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Check,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface ClientItem {
  id: string;
  client_code: string;
  portal_token: string;
  status: string;
  total_contracted: number;
  company_name: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  niche: string;
  projects_count: number;
  briefings_count: number;
  created_at: string;
}

interface ClientsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const copyPortalLink = (token: string, clientId: string) => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(clientId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-foreground mb-3">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            Carteira Ativa & Faturamento
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Diretório de <span className="font-serif italic font-normal text-muted-foreground">Clientes</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-sans">
            Controle consolidado de contratos, entregas em produção e links de autoatendimento criptografados do Portal do Cliente.
          </p>
        </div>
      </div>

      {/* Clients Table (3-dot chrome frame) */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        {/* Window Chrome */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="font-mono text-[11px] text-foreground uppercase tracking-widest font-semibold">
              Contratos & Chaves de Acesso ao Portal ({clients.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Seguro & Tokenizado
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Empresa / Cliente</th>
                <th className="p-4">Localização</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Total Contratado</th>
                <th className="p-4">Projetos</th>
                <th className="p-4 text-right">Portal do Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {clients.map((cli, idx) => {
                const indexNum = String(idx + 1).padStart(2, '0');
                return (
                  <tr key={cli.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="p-4 font-mono font-bold text-foreground flex items-center gap-2">
                      <span className="text-muted-foreground text-[10px]">{indexNum}.</span>
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs">{cli.client_code}</span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      <div>
                        <span className="text-sm uppercase tracking-tight font-black block">
                          {cli.company_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                          {cli.niche}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-sans">
                      {cli.city} - {cli.state}
                    </td>
                    <td className="p-4 text-foreground">
                      <div>
                        <span className="font-mono text-xs">{cli.phone || '—'}</span>
                        <span className="block text-[11px] text-muted-foreground">{cli.email || ''}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-foreground text-sm">
                      {formatBRL(cli.total_contracted)}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">
                      <span className="px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground text-[11px] font-semibold">
                        {cli.projects_count} projeto(s)
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => copyPortalLink(cli.portal_token, cli.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-secondary border border-border text-foreground font-medium text-xs transition-all shadow-xs"
                        title="Copiar link seguro do portal"
                      >
                        {copiedId === cli.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span className="font-mono text-[11px]">{copiedId === cli.id ? 'Copiado!' : 'Copiar Link'}</span>
                      </button>

                      <a
                        href={`/portal/${cli.portal_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-black font-black uppercase text-[11px] tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                      >
                        <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                        <span>Abrir Portal</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && (
          <div className="p-16 text-center space-y-3 bg-card">
            <Building className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <h4 className="font-black text-sm text-foreground uppercase">Nenhum cliente cadastrado ainda</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
              Clientes são criados e ganham credenciais do portal automaticamente ao converter leads no CRM ou assinar propostas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
