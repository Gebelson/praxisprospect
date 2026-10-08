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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-primary mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            Carteira Ativa & Faturamento
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Diretório de <span className="font-serif italic font-normal text-primary">Clientes</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Controle consolidado de contratos, entregas em produção e links de autoatendimento criptografados.
          </p>
        </div>
      </div>

      {/* Clients Table (3-dot chrome frame) */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Window Chrome */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest font-semibold">
              Contratos & Chaves de Acesso ao Portal ({clients.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              AES-256 Tokenized
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Empresa</th>
                <th className="p-4">Localização</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Total Contratado</th>
                <th className="p-4">Projetos</th>
                <th className="p-4 text-right">Portal do Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {clients.map((cli, idx) => {
                const indexNum = String(idx + 1).padStart(2, '0');
                return (
                  <tr key={cli.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="p-4 font-mono font-bold text-primary flex items-center gap-2">
                      <span className="text-neutral-600 text-[10px]">{indexNum}.</span>
                      <span>{cli.client_code}</span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div>
                        <span className="group-hover:text-primary transition-colors text-sm uppercase tracking-tight font-black block">
                          {cli.company_name}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                          {cli.niche}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-400 font-sans">
                      {cli.city} - {cli.state}
                    </td>
                    <td className="p-4 text-neutral-300">
                      <div>
                        <span className="font-mono text-xs">{cli.phone || '—'}</span>
                        <span className="block text-[11px] text-neutral-500">{cli.email || ''}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-white text-sm">
                      {formatBRL(cli.total_contracted)}
                    </td>
                    <td className="p-4 text-neutral-400 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[11px]">
                        {cli.projects_count} projeto(s)
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => copyPortalLink(cli.portal_token, cli.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-all"
                        title="Copiar link criptografado do portal"
                      >
                        {copiedId === cli.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
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
          <div className="p-16 text-center space-y-3 bg-white/[0.01]">
            <Building className="w-10 h-10 text-neutral-600 mx-auto" />
            <h4 className="font-black text-sm text-white uppercase">Nenhum cliente cadastrado</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
              Clientes são criados e ganham credenciais do portal automaticamente ao converter leads no CRM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
