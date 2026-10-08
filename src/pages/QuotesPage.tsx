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
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border border-primary/30 bg-primary/15 text-foreground mb-3">
            <Calculator className="w-3.5 h-3.5 text-primary" />
            Precificação Inteligente & Lucratividade
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Calculadora de <span className="font-serif italic font-normal text-muted-foreground">Orçamentos</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Calcule o preço justo de qualquer site baseado em esforço real, custo por hora e margem garantida.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveQuote}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs transition-all shadow-xs"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Orçamento'}</span>
          </button>

          <button
            onClick={() => {
              if (onSetGeneratedQuote && calculation) {
                onSetGeneratedQuote(calculation);
              }
              onNavigate('proposals');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-extrabold uppercase tracking-wider text-xs transition-all shadow-md shadow-primary/25"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Criar Proposta Oficial</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Parameter Adjusters (1 col) */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <span className="font-mono text-xs font-black text-primary">01.</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Personalizar Escopo do Site
            </h3>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              Tipo de Projeto *
            </label>
            <select
              value={projectType}
              onChange={(e: any) => setProjectType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-sans"
            >
              <option value="landing_page">Landing Page de Alta Conversão (18h)</option>
              <option value="institucional">Site Institucional (até 4 págs) (35h)</option>
              <option value="multipaginas">Site Multipáginas Corporativo (55h)</option>
              <option value="ecommerce">E-commerce / Loja Virtual (80h)</option>
              <option value="sistema_web">Sistema Web Personalizado (110h)</option>
            </select>
          </div>

          {/* Extra Pages */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              Páginas Adicionais (+6h cada)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={extraPagesCount}
              onChange={(e) => setExtraPagesCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Add-ons Checklist */}
          <div className="space-y-2.5 pt-3 border-t border-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
              Recursos e Serviços Adicionais
            </label>
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSeo}
                onChange={(e) => setIncludeSeo(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="font-medium">Otimização SEO para Google (+10h)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCopywriting}
                onChange={(e) => setIncludeCopywriting(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="font-medium">Redação de Textos Profissionais (Copy) (+12h)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCms}
                onChange={(e) => setIncludeCms(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="font-medium">Painel Administrativo para o Cliente (+14h)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAnimations}
                onChange={(e) => setIncludeAnimations(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="font-medium">Animações e Efeitos Modernos (+8h)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMultiLanguage}
                onChange={(e) => setIncludeMultiLanguage(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="font-medium">Site Bilíngue (Português / Inglês) (+12h)</span>
            </label>
          </div>

          {/* Modifiers */}
          <div className="space-y-4 pt-3 border-t border-border">
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="font-bold text-amber-600 dark:text-amber-400">Entrega com Prazo Expresso (+35%)</span>
            </label>

            <div>
              <div className="flex justify-between text-xs text-foreground mb-1.5 font-sans font-semibold">
                <span>Custo-Hora da Agência:</span>
                <span className="font-mono font-bold text-foreground">R$ {hourlyRate},00/h</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Output & Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Output Cards Header (Destaques Claros & Iluminados) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-6 bg-card border border-border shadow-sm">
              <span className="text-[11px] font-mono uppercase text-muted-foreground font-bold block">Horas Estimadas</span>
              <span className="text-3xl font-black font-mono text-foreground mt-1.5 block">
                {calculation ? `${calculation.totalHours}h` : '—'}
              </span>
              <span className="text-[11px] text-muted-foreground mt-2 block font-sans">
                Custo interno: {calculation ? formatBRL(calculation.internalCost) : '—'}
              </span>
            </div>

            <div className="rounded-2xl p-6 bg-primary/20 border border-primary/40 shadow-sm relative overflow-hidden">
              <span className="text-[11px] font-mono uppercase text-foreground font-black tracking-wider block">
                PREÇO SUGERIDO
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-foreground mt-1.5 block tracking-tight">
                {calculation ? formatBRL(calculation.suggestedPrice) : '—'}
              </span>
              <span className="text-[11px] font-semibold text-foreground mt-2 block font-sans">
                Lucro estimado: {calculation ? formatBRL(calculation.profitMarginValue) : '—'}
              </span>
            </div>

            <div className="rounded-2xl p-6 bg-card border border-border shadow-sm">
              <span className="text-[11px] font-mono uppercase text-muted-foreground font-bold block">Piso Mínimo</span>
              <span className="text-3xl font-black font-mono text-foreground mt-1.5 block">
                {calculation ? formatBRL(calculation.minPrice) : '—'}
              </span>
              <span className="text-[11px] text-muted-foreground mt-2 block font-sans">
                Valor para não ter prejuízo
              </span>
            </div>
          </div>

          {/* Payment Plans Simulation */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-foreground">
                3 Opções de Pagamento para Apresentar ao Cliente
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {calculation?.paymentPlans.map((plan, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-2">
                  <span className="font-bold text-xs text-foreground uppercase block">{plan.title}</span>
                  <div className="text-xl font-black font-mono text-foreground">{formatBRL(plan.totalValue)}</div>
                  <p className="text-xs text-muted-foreground font-sans">
                    {plan.installments > 1
                      ? `${plan.installments} parcelas de ${formatBRL(plan.installmentValue)}`
                      : 'Pagamento à vista'}
                  </p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {plan.discountOrFeeDescription}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Scope Breakdown Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 px-6 border-b border-border bg-secondary/30">
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                Composição Detalhada do Valor
              </h3>
            </div>
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-border text-muted-foreground font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Item do Escopo</th>
                  <th className="p-4 text-right">Horas</th>
                  <th className="p-4 text-right">Valor Sugerido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {calculation?.items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{item.category}</td>
                    <td className="p-4 text-muted-foreground">{item.description}</td>
                    <td className="p-4 font-mono text-right text-muted-foreground">{item.hours}h</td>
                    <td className="p-4 font-mono font-bold text-right text-foreground">
                      {formatBRL(item.suggestedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
