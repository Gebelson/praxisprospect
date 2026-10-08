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

interface NavGroup {
  groupLabel: string;
  items: Array<{
    id: NavigationModule;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
}) => {
  const navGroups: NavGroup[] = [
    {
      groupLabel: 'Operação Principal',
      items: [
        { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'prospecting', label: 'Encontrar Clientes', icon: Compass, badge: 'Grátis' },
        { id: 'crm', label: 'Funil de Vendas (CRM)', icon: Users2 },
      ],
    },
    {
      groupLabel: 'Vendas & Contratos',
      items: [
        { id: 'clients', label: 'Meus Clientes & Portal', icon: Briefcase },
        { id: 'quotes', label: 'Calculadora de Preço', icon: Calculator },
        { id: 'proposals', label: 'Propostas & Contratos', icon: FileCheck2 },
      ],
    },
    {
      groupLabel: 'Produção & Criação',
      items: [
        { id: 'projects', label: 'Andamento dos Projetos', icon: FolderGit2 },
        { id: 'briefings', label: 'Briefings & Requisitos', icon: FileText },
        { id: 'sites', label: 'Gerador de Sites', icon: Globe2, badge: 'Demos' },
      ],
    },
    {
      groupLabel: 'Automação & IA',
      items: [
        { id: 'prompts', label: 'Prompts & Imagens', icon: ImageIcon },
        { id: 'automations', label: 'Automações Inteligentes', icon: Cpu },
        { id: 'messages', label: 'Mensagens Prontas', icon: MessageSquare },
      ],
    },
    {
      groupLabel: 'Gestão da Agência',
      items: [
        { id: 'financial', label: 'Controle Financeiro', icon: DollarSign },
        { id: 'reports', label: 'Relatórios de Vendas', icon: BarChart3 },
        { id: 'settings', label: 'Configurações', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#121316] flex flex-col h-screen select-none shrink-0 transition-all z-20 shadow-2xl">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/praxis-logo-white.png"
            alt="PRAXIS"
            className="h-6 w-auto object-contain"
          />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary text-black font-extrabold shadow-sm">
          AGENCY
        </span>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
              {group.groupLabel}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-black font-extrabold shadow-md shadow-primary/25 scale-[1.01]'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-black/20 text-black'
                          : 'bg-white/10 text-primary border border-white/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info & Local Agent Status */}
      <div className="p-4 border-t border-white/10 bg-black/50">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-xs shadow-primary animate-pulse"></span>
            <span className="text-xs font-mono font-medium text-neutral-200">Motor Local</span>
          </div>
          <span className="text-[10px] font-mono text-primary font-black">100% GRATUITO</span>
        </div>
      </div>
    </aside>
  );
};
