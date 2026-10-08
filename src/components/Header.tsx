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
  dashboard: { title: 'Visão Geral', subtitle: 'Painel executivo com métricas comerciais, funil e tarefas prioritárias' },
  prospecting: { title: 'Encontrar Clientes', subtitle: 'Pesquise empresas por cidade e nicho com diagnóstico gratuito de website' },
  crm: { title: 'Funil de Vendas (CRM)', subtitle: 'Gerencie oportunidades comerciais desde o primeiro contato até o fechamento' },
  clients: { title: 'Meus Clientes & Portal', subtitle: 'Lista de empresas atendidas, faturamento e links de autoatendimento criptografados' },
  briefings: { title: 'Briefings & Requisitos', subtitle: 'Questionários guiados passo a passo para entender as necessidades do cliente' },
  quotes: { title: 'Calculadora de Orçamentos', subtitle: 'Cálculo inteligente de preço justo por horas e complexidade com margem garantida' },
  proposals: { title: 'Propostas Comerciais', subtitle: 'Geração de propostas profissionais com contrato integrado e assinatura digital' },
  projects: { title: 'Andamento dos Projetos', subtitle: 'Controle de etapas, checklist de tarefas e entrega técnica do site' },
  sites: { title: 'Gerador de Sites Demonstrativos', subtitle: 'Crie demonstrações visuais responsivas para apresentar ao potencial cliente' },
  prompts: { title: 'Prompts & Direção de Arte', subtitle: 'Especificações completas para IA de desenvolvimento e criação de imagens' },
  automations: { title: 'Automações Inteligentes', subtitle: 'Regras automáticas para envio de mensagens e acompanhamento sem trabalho manual' },
  messages: { title: 'Mensagens Prontas', subtitle: 'Modelos testados de mensagens para WhatsApp, Instagram e E-mail em 1 clique' },
  financial: { title: 'Controle Financeiro', subtitle: 'Acompanhe pagamentos recebidos via PIX/Cartão, saldos a receber e fluxo de caixa' },
  reports: { title: 'Relatórios & Resultados', subtitle: 'Estatísticas de conversão de vendas, faturamento e nichos mais lucrativos' },
  settings: { title: 'Configurações', subtitle: 'Identidade da agência, valores padrão por hora e backup dos seus dados' },
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
    <header className="h-20 border-b border-border bg-card/80 backdrop-blur-xl px-6 sm:px-8 flex items-center justify-between z-10 shrink-0 transition-colors">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-primary-foreground bg-primary px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
            PRAXIS
          </span>
          <span className="text-xs text-muted-foreground">/</span>
          <h1 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight font-sans leading-none">
            {current.title}
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 hidden sm:block font-normal">{current.subtitle}</p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs transition-all shadow-xs"
          title="Buscar ou executar comando (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-foreground" />
          <span className="hidden md:inline font-sans font-medium">Buscar no sistema...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-background border border-border rounded text-muted-foreground">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground transition-all shadow-xs"
          title="Central de Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-card animate-pulse shadow-xs" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground transition-all shadow-xs"
          title={theme === 'dark' ? 'Mudar para modo claro (Cores do PDF)' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
        </button>

        {/* Environment Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-foreground text-xs font-mono font-bold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>SISTEMA ATIVO • R$ 0</span>
        </div>
      </div>
    </header>
  );
};
