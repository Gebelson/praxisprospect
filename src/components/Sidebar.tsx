import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Users2,
  Briefcase,
  FileText,
  Calculator,
  FileCheck2,
  FolderGit2,
  Globe2,
  Image as ImageIcon,
  Cpu,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export type NavigationModule =
  | 'dashboard'
  | 'prospecting'
  | 'crm'
  | 'clients'
  | 'briefings'
  | 'quotes'
  | 'proposals'
  | 'projects'
  | 'sites'
  | 'prompts'
  | 'automations'
  | 'messages'
  | 'financial'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
}) => {
  const navItems: Array<{
    id: NavigationModule;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prospecting', label: 'Captação', icon: Compass, badge: 'Overpass' },
    { id: 'crm', label: 'Leads & CRM', icon: Users2 },
    { id: 'clients', label: 'Clientes', icon: Briefcase },
    { id: 'briefings', label: 'Briefings', icon: FileText },
    { id: 'quotes', label: 'Orçamentos', icon: Calculator },
    { id: 'proposals', label: 'Propostas', icon: FileCheck2 },
    { id: 'projects', label: 'Projetos', icon: FolderGit2 },
    { id: 'sites', label: 'Gerador de Sites', icon: Globe2, badge: 'Demos' },
    { id: 'prompts', label: 'Prompts & Imagens', icon: ImageIcon },
    { id: 'automations', label: 'Automações', icon: Cpu },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#070709] flex flex-col h-screen select-none shrink-0 transition-all z-20">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <img
            src="/praxis-logo-white.png"
            alt="PRAXIS"
            className="h-6 w-auto object-contain"
          />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/25 shadow-xs shadow-primary/20">
          OS
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
          Módulos do Sistema
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20 scale-[1.01]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/50'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : 'bg-white/5 border border-white/10 text-white/50'
                  }`}
                >
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-black opacity-80" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Footer Info & Local Agent Status */}
      <div className="p-4 border-t border-white/[0.08] bg-black/40">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-xs shadow-primary animate-pulse"></span>
            <span className="text-xs font-mono font-medium text-white/80">Praxis Engine</span>
          </div>
          <span className="text-[10px] font-mono text-primary font-bold">R$ 0/MÊS</span>
        </div>
      </div>
    </aside>
  );
};
