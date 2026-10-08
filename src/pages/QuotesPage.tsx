import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  DollarSign,
  Clock,
  Layers,
} from 'lucide-react';
import { QuoteCalculationResult } from '../../server/src/services/pricingEngine';
import { NavigationModule } from '../components/Sidebar';

interface QuotesPageProps {
  onNavigate: (module: NavigationModule) => void;
  onSetGeneratedQuote?: (quote: any) => void;
}

export const QuotesPage: React.FC<QuotesPageProps> = ({ onNavigate, onSetGeneratedQuote }) => {
  const [projectType, setProjectType] = useState<'landing_page' | 'institucional' | 'multipaginas' | 'ecommerce' | 'sistema_web'>('institucional');
  const [extraPagesCount, setExtraPagesCount] = useState(0);
  const [includeSeo, setIncludeSeo] = useState(true);
  const [includeCopywriting, setIncludeCopywriting] = useState(true);
  const [includeCms, setIncludeCms] = useState(false);
  const [includeAnimations, setIncludeAnimations] = useState(false);
  const [includeMultiLanguage, setIncludeMultiLanguage] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(80);
  const [targetMargin, setTargetMargin] = useState(0.45);

  const [title, setTitle] = useState('Orçamento de Desenvolvimento Web');
  const [calculation, setCalculation] = useState<QuoteCalculationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    runCalculation();
  }, [
    projectType,
    extraPagesCount,
    includeSeo,
    includeCopywriting,
    includeCms,
    includeAnimations,
    includeMultiLanguage,
    isUrgent,
    hourlyRate,
    targetMargin,
  ]);

  const runCalculation = async () => {
    try {
      const res = await fetch('/api/quotes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType,
          extraPagesCount: Number(extraPagesCount),
          includeSeo,
          includeCopywriting,
          includeCms,
          includeAnimations,
          includeMultiLanguage,
          isUrgent,
          customHourlyRate: Number(hourlyRate),
          customTargetMargin: Number(targetMargin),
        }),
      });
      const data = await res.json();
      setCalculation(data);
    } catch (err) {
      console.error('Erro no cálculo:', err);
    }
  };

  const handleSaveQuote = async () => {
    if (!calculation) return;
    try {
      setSaving(true);
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          calculationResult: calculation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Motor de Precificação & Orçamentos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cálculo determinístico e auditável baseado em esforço real, reserva de risco e margem comercial sustentável.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveQuote}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs transition-all shadow-xs"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Orçamento Salvo!' : 'Salvar Orçamento'}</span>
          </button>

          <button
            onClick={() => {
              if (onSetGeneratedQuote && calculation) {
                onSetGeneratedQuote(calculation);
              }
              onNavigate('proposals');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-primary/25 hover:scale-105"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Gerar Proposta Comercial</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Parameter Adjusters (1 col) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Parâmetros do Escopo</span>
          </h3>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Tipo de Projeto</label>
            <select
              value={projectType}
              onChange={(e: any) => setProjectType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="landing_page">Landing Page de Alta Conversão (18h)</option>
              <option value="institucional">Site Institucional (até 4 págs) (35h)</option>
              <option value="multipaginas">Site Multipáginas Corporativo (55h)</option>
              <option value="ecommerce">E-commerce Completo (80h)</option>
              <option value="sistema_web">Sistema Web Personalizado (110h)</option>
            </select>
          </div>

          {/* Extra Pages */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Páginas Adicionais (+6h cada)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={extraPagesCount}
              onChange={(e) => setExtraPagesCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Add-ons Checklist */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-foreground mb-1">Opcionais & Recursos</label>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSeo}
                onChange={(e) => setIncludeSeo(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Pacote SEO Técnico On-Page (+10h)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCopywriting}
                onChange={(e) => setIncludeCopywriting(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Redação Publicitária (Copywriting) (+12h)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCms}
                onChange={(e) => setIncludeCms(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Painel de Edição de Textos (CMS) (+14h)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAnimations}
                onChange={(e) => setIncludeAnimations(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Microinterações & Animações Fluidas (+8h)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMultiLanguage}
                onChange={(e) => setIncludeMultiLanguage(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Suporte Bilíngue (PT / EN) (+12h)</span>
            </label>
          </div>

          {/* Modifiers */}
          <div className="space-y-3 pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="font-semibold text-amber-500">Taxa de Urgência / Prazo Expresso (+35%)</span>
            </label>

            <div>
              <div className="flex justify-between text-xs text-foreground mb-1">
                <span>Custo-Hora Interno:</span>
                <span className="font-mono font-semibold">R$ {hourlyRate},00/h</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Output & Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Output Cards Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-white/50 block">Horas Estimadas</span>
              <span className="text-3xl font-black font-mono text-white mt-1.5 block">
                {calculation ? `${calculation.totalHours}h` : '—'}
              </span>
              <span className="text-[11px] font-mono text-white/40 mt-2 block">
                Custo base: {calculation ? formatBRL(calculation.internalCost) : '—'}
              </span>
            </div>

            <div className="rounded-2xl p-6 bg-primary/10 border border-primary/30 shadow-xl shadow-primary/10">
              <span className="text-[11px] font-mono uppercase text-primary font-bold tracking-wider block">
                Preço Sugerido
              </span>
              <span className="text-3xl font-black font-mono text-primary mt-1.5 block">
                {calculation ? formatBRL(calculation.suggestedPrice) : '—'}
              </span>
              <span className="text-[11px] font-mono text-white/70 font-medium mt-2 block">
                Lucro líquido: {calculation ? formatBRL(calculation.profitMarginValue) : '—'}
              </span>
            </div>

            <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/10 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-white/50 block">Piso de Segurança</span>
              <span className="text-3xl font-black font-mono text-white mt-1.5 block">
                {calculation ? formatBRL(calculation.minPrice) : '—'}
              </span>
              <span className="text-[11px] font-mono text-white/40 mt-2 block">
                Cobre custos e reserva
              </span>
            </div>
          </div>

          {/* Payment Plans Simulation */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-foreground">Simulação de Planos de Pagamento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {calculation?.paymentPlans.map((plan, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-border bg-secondary/20 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{plan.title}</span>
                    <span className="font-mono font-bold text-primary">{formatBRL(plan.totalValue)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {plan.installments > 1
                      ? `${plan.installments}x de ${formatBRL(plan.installmentValue)}`
                      : 'Pagamento único'}
                  </p>
                  <span className="text-[10px] text-emerald-500 font-medium block">
                    {plan.discountOrFeeDescription}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Scope Breakdown Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border bg-secondary/30">
              <h3 className="font-bold text-xs text-foreground">Composição Detalhada do Orçamento</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Item do Escopo</th>
                  <th className="p-3 text-right">Horas</th>
                  <th className="p-3 text-right">Valor Sugerido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {calculation?.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-foreground">{item.category}</td>
                    <td className="p-3 text-muted-foreground">{item.description}</td>
                    <td className="p-3 font-mono text-right">{item.hours}h</td>
                    <td className="p-3 font-mono font-semibold text-right text-foreground">
                      {formatBRL(item.suggestedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit Formula Box */}
          <div className="p-4 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground font-mono space-y-1">
            <span className="font-bold text-foreground block">Auditoria do Cálculo:</span>
            <p className="leading-relaxed">{calculation?.auditFormula}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
