import React from 'react';
import { Search, Bell, Sun, Moon, ShieldCheck } from 'lucide-react';
import { NavigationModule } from './Sidebar';

interface HeaderProps {
  currentModule: NavigationModule;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const MODULE_TITLES: Record<NavigationModule, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Geral', subtitle: 'Visão executiva em tempo real da operação comercial e técnica' },
  prospecting: { title: 'Captação de Clientes', subtitle: 'Prospecção assistida por fontes públicas e diretórios abertos' },
  crm: { title: 'Pipeline de Vendas & Leads', subtitle: 'Funil comercial, qualificação de oportunidades e histórico LGPD' },
  clients: { title: 'Gestão de Clientes', subtitle: 'Diretório de empresas, projetos associados e tokens de portal' },
  briefings: { title: 'Briefings Comerciais & Produção', subtitle: 'Coleta guiada de requisitos com formulário interativo de cliente' },
  quotes: { title: 'Gerador de Orçamentos', subtitle: 'Precificação determinística auditável com cálculo de horas e margem' },
  proposals: { title: 'Propostas Comerciais', subtitle: 'Documento completo em 19 seções com termo de aceite digital auditável' },
  projects: { title: 'Gestão de Projetos', subtitle: 'Cronograma em 14 etapas, checklist de tarefas e controle de revisões' },
  sites: { title: 'Gerador de Sites Demonstrativos', subtitle: 'Criação de páginas conceituais personalizadas para abordagem comercial' },
  prompts: { title: 'Gerador de Prompts & Direção de Arte', subtitle: 'Prompts mestres de desenvolvimento e fichas de fotografia para IA' },
  automations: { title: 'Motor de Automações', subtitle: 'Regras de eventos, condições e ações com execução sem loops' },
  messages: { title: 'Scripts de Abordagem Multicanal', subtitle: 'Gerador de mensagens diretas para WhatsApp, Instagram, Email e LinkedIn' },
  financial: { title: 'Módulo Financeiro', subtitle: 'Faturamento contratado, parcelas, recebimentos e conciliação' },
  reports: { title: 'Relatórios & Inteligência', subtitle: 'Indicadores de conversão, ticket médio e tempo de ciclo por nicho' },
  settings: { title: 'Configurações do Sistema', subtitle: 'Dados da agência, status do Antigravity, regras e backup' },
};

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onOpenCommandPalette,
  onOpenNotifications,
  unreadCount,
  theme,
  onToggleTheme,
}) => {
  const current = MODULE_TITLES[currentModule] || { title: 'Praxis', subtitle: '' };

  return (
    <header className="h-20 border-b border-white/[0.08] bg-[#070709]/80 backdrop-blur-xl px-8 flex items-center justify-between z-10 shrink-0">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-primary uppercase tracking-widest font-bold">PRAXIS OS</span>
          <span className="text-xs text-white/30">/</span>
          <h1 className="text-base font-black text-white uppercase tracking-tight font-sans leading-none">
            {current.title}
          </h1>
        </div>
        <p className="text-xs text-white/50 mt-1 hidden sm:block font-normal">{current.subtitle}</p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/60 hover:text-white text-xs transition-all shadow-xs"
          title="Buscar ou executar comando (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-primary" />
          <span className="hidden md:inline font-sans">Buscar no sistema...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-black/60 border border-white/10 rounded text-white/50">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:text-white transition-all"
          title="Central de Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-black animate-pulse shadow-xs shadow-primary" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:text-white transition-all"
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Environment Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-bold shadow-xs shadow-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SQLITE LOCAL • R$ 0</span>
        </div>
      </div>
    </header>
  );
};
