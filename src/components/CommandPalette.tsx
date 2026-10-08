import React, { useState, useEffect } from 'react';
import { Search, Compass, Calculator, Globe, FileCheck, Users, Plus, X } from 'lucide-react';
import { NavigationModule } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: NavigationModule) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'Ir para Dashboard', module: 'dashboard' as NavigationModule, category: 'Navegação' },
    { label: 'Nova Captação de Leads (OpenStreetMap)', module: 'prospecting' as NavigationModule, category: 'Ações Rápidas' },
    { label: 'Abrir Funil de Vendas (CRM)', module: 'crm' as NavigationModule, category: 'Navegação' },
    { label: 'Calcular Novo Orçamento', module: 'quotes' as NavigationModule, category: 'Ações Rápidas' },
    { label: 'Criar Proposta Comercial (19 Seções)', module: 'proposals' as NavigationModule, category: 'Ações Rápidas' },
    { label: 'Gerar Site Demonstrativo de Nicho', module: 'sites' as NavigationModule, category: 'Ações Rápidas' },
    { label: 'Gerador de Prompts de Desenvolvimento', module: 'prompts' as NavigationModule, category: 'Navegação' },
    { label: 'Acessar Gestão Financeira', module: 'financial' as NavigationModule, category: 'Navegação' },
    { label: 'Configurações & Status Antigravity', module: 'settings' as NavigationModule, category: 'Sistema' },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Digite um comando ou módulo... (ex: orçamento, leads, site)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Nenhum comando correspondente encontrado.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(item.module);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors text-left group"
              >
                <span>{item.label}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground group-hover:text-foreground">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-secondary/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Dica: Use as setas e Enter para navegar</span>
          <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">ESC</kbd>
        </div>
      </div>
    </div>
  );
};
