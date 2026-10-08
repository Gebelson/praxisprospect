import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Download,
  Save,
  Check,
  RefreshCw,
  Terminal,
  DollarSign,
  Building,
  Sliders,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface SettingsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<any>({});
  const [antigravityStatus, setAntigravityStatus] = useState<any | null>(null);
  const [checkingAg, setCheckingAg] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Agency profile
  const [agencyName, setAgencyName] = useState('Praxis Digital Studio');
  const [agencyPhone, setAgencyPhone] = useState('(11) 98765-4321');
  const [agencyEmail, setAgencyEmail] = useState('contato@praxis.local');
  const [agencyCnpj, setAgencyCnpj] = useState('00.000.000/0001-00');

  // Pricing rules
  const [hourlyRate, setHourlyRate] = useState(80);
  const [minProjectFloor, setMinProjectFloor] = useState(1200);

  useEffect(() => {
    fetchSettings();
    checkAntigravity();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      if (data.agency_profile?.value) {
        const p = data.agency_profile.value;
        setAgencyName(p.name || 'Praxis Digital Studio');
        setAgencyPhone(p.phone || '(11) 98765-4321');
        setAgencyEmail(p.email || 'contato@praxis.local');
        setAgencyCnpj(p.cnpj || '00.000.000/0001-00');
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  };

  const checkAntigravity = async () => {
    try {
      setCheckingAg(true);
      const res = await fetch('/api/settings/antigravity-status');
      const data = await res.json();
      setAntigravityStatus(data);
    } catch (err) {
      console.error('Erro ao consultar status do Antigravity:', err);
    } finally {
      setCheckingAg(false);
    }
  };

  const handleSaveAgencyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings/agency_profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: {
            name: agencyName,
            phone: agencyPhone,
            email: agencyEmail,
            cnpj: agencyCnpj,
          },
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-primary mb-3">
            <Sliders className="w-3.5 h-3.5" />
            Preferências & Infraestrutura Local
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Configurações da <span className="font-serif italic font-normal text-primary">Plataforma</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Identidade cadastral da agência, piso de precificação comercial, diagnóstico do Antigravity local e backups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Agency & Pricing Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agency Profile (3-dot chrome frame) */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">
                  Identidade & Perfil da Agência
                </h3>
              </div>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> SALVO COM SUCESSO!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveAgencyProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    Nome Comercial da Agência *
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    CNPJ (Opcional)
                  </label>
                  <input
                    type="text"
                    value={agencyCnpj}
                    onChange={(e) => setAgencyCnpj(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    WhatsApp de Atendimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyPhone}
                    onChange={(e) => setAgencyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    E-mail Comercial *
                  </label>
                  <input
                    type="email"
                    required
                    value={agencyEmail}
                    onChange={(e) => setAgencyEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar Dados da Agência</span>
                </button>
              </div>
            </form>
          </div>

          {/* Pricing Rules */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="font-black text-sm text-white uppercase tracking-tight">
                Regras Globais de Precificação
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Custo-Hora Padrão (R$/h)
                </span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-black/40 text-white font-mono focus:outline-none focus:border-primary"
                />
                <span className="text-[11px] text-neutral-500 block">Valor base para cálculo automático de esforço</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Piso Mínimo Comercial Sugerido (R$)
                </span>
                <input
                  type="number"
                  value={minProjectFloor}
                  onChange={(e) => setMinProjectFloor(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-black/40 text-white font-mono focus:outline-none focus:border-primary"
                />
                <span className="text-[11px] text-neutral-500 block">Garante margem mínima sustentável (&ge; R$ 1.000)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Antigravity Diagnostic & Backup (1 col) */}
        <div className="space-y-6">
          {/* Antigravity CLI Diagnostic Card (3-dot chrome) */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">
                  Google Antigravity
                </h3>
              </div>
              <button
                onClick={checkAntigravity}
                disabled={checkingAg}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Verificar novamente"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingAg ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {antigravityStatus ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      antigravityStatus.isInstalled ? 'bg-primary animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  <span className="font-bold text-white font-mono">
                    {antigravityStatus.isInstalled ? 'Binário Local Detectado' : 'Não Instalado'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] space-y-1.5">
                  <div className="text-neutral-300">
                    <strong className="text-white">Versão:</strong> {antigravityStatus.version || 'v1.107.0 (Antigravity IDE)'}
                  </div>
                  <div className="truncate text-neutral-400 text-[10px]">
                    <strong className="text-white">Path:</strong> {antigravityStatus.ideBinaryPath || antigravityStatus.cliBinaryPath || 'N/A'}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  {antigravityStatus.details}
                </p>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 font-mono">Verificando ambiente local...</div>
            )}
          </div>

          {/* Backup & Persistence Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-black text-sm text-white uppercase tracking-tight">
                Persistência & Backup
              </h3>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              O Praxis armazena 100% dos dados em banco SQLite ACID seguro com integridade referencial local e custo zero.
            </p>

            <a
              href="/api/settings/backup"
              download
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              <span>Baixar Backup Completo (JSON)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
