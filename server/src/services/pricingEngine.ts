export interface PricingInput {
  projectType: 'landing_page' | 'institucional' | 'multipaginas' | 'ecommerce' | 'sistema_web';
  extraPagesCount?: number;
  includeSeo?: boolean;
  includeCopywriting?: boolean;
  includeCms?: boolean;
  includeAnimations?: boolean;
  includeMultiLanguage?: boolean;
  isUrgent?: boolean;
  customHourlyRate?: number;
  customTargetMargin?: number;
}

export interface QuoteItemBreakdown {
  id: string;
  category: string;
  description: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  suggestedValue: number;
}

export interface PaymentPlanOption {
  type: string;
  title: string;
  installments: number;
  installmentValue: number;
  totalValue: number;
  discountOrFeeDescription: string;
}

export interface QuoteCalculationResult {
  projectType: string;
  totalHours: number;
  hourlyRate: number;
  internalCost: number;
  riskReservePercent: number;
  targetMarginPercent: number;
  urgencyMultiplier: number;
  minPrice: number;
  suggestedPrice: number;
  profitMarginValue: number;
  items: QuoteItemBreakdown[];
  paymentPlans: PaymentPlanOption[];
  auditFormula: string;
}

const BASE_HOURS_MAP: Record<string, { label: string; hours: number }> = {
  landing_page: { label: 'Landing Page de Alta Conversão', hours: 18 },
  institucional: { label: 'Site Institucional Estruturado (até 4 páginas)', hours: 35 },
  multipaginas: { label: 'Site Multipáginas Corporativo (até 8 páginas)', hours: 55 },
  ecommerce: { label: 'E-commerce Completo com Catálogo & Checkout', hours: 80 },
  sistema_web: { label: 'Portal / Sistema Web Personalizado com Autenticação', hours: 110 },
};

export const calculateProjectQuote = (input: PricingInput): QuoteCalculationResult => {
  const hourlyRate = input.customHourlyRate || 80; // R$ 80/h base
  const targetMargin = input.customTargetMargin || 0.45; // 45% margin
  const riskReserve = 0.15; // 15% risk buffer
  const urgencyMultiplier = input.isUrgent ? 1.35 : 1.0;
  const minPriceFloor = 1200; // Minimum commercial price floor

  const items: QuoteItemBreakdown[] = [];
  let totalHours = 0;

  // 1. Base project scope
  const baseSpec = BASE_HOURS_MAP[input.projectType] || BASE_HOURS_MAP.landing_page;
  totalHours += baseSpec.hours;
  items.push({
    id: 'base_scope',
    category: 'Desenvolvimento Base',
    description: baseSpec.label,
    hours: baseSpec.hours,
    hourlyRate,
    totalCost: baseSpec.hours * hourlyRate,
    suggestedValue: 0, // will be computed with margin factor
  });

  // 2. Extra pages
  const extraPages = Math.max(0, input.extraPagesCount || 0);
  if (extraPages > 0) {
    const extraHours = extraPages * 6; // 6h per page
    totalHours += extraHours;
    items.push({
      id: 'extra_pages',
      category: 'Expansão de Escopo',
      description: `${extraPages} Página(s) Adicional(is) (Estrutura, Conteúdo e Design)`,
      hours: extraHours,
      hourlyRate,
      totalCost: extraHours * hourlyRate,
      suggestedValue: 0,
    });
  }

  // 3. Technical SEO Package
  if (input.includeSeo) {
    const hours = 10;
    totalHours += hours;
    items.push({
      id: 'addon_seo',
      category: 'Otimização Técnica',
      description: 'Otimização SEO On-Page, Schema.org, Metatags OpenGraph e Sitemap XML',
      hours,
      hourlyRate,
      totalCost: hours * hourlyRate,
      suggestedValue: 0,
    });
  }

  // 4. Copywriting & Content Writing
  if (input.includeCopywriting) {
    const hours = 12;
    totalHours += hours;
    items.push({
      id: 'addon_copy',
      category: 'Conteúdo & Redação',
      description: 'Redação Publicitária Persuasiva (Copywriting) para todas as seções principais',
      hours,
      hourlyRate,
      totalCost: hours * hourlyRate,
      suggestedValue: 0,
    });
  }

  // 5. CMS / Administrative Management
  if (input.includeCms) {
    const hours = 14;
    totalHours += hours;
    items.push({
      id: 'addon_cms',
      category: 'Gestão Dinâmica',
      description: 'Painel Administrativo para Edição de Textos, Notícias e Banners sem código',
      hours,
      hourlyRate,
      totalCost: hours * hourlyRate,
      suggestedValue: 0,
    });
  }

  // 6. Micro-animations & Interaction Design
  if (input.includeAnimations) {
    const hours = 8;
    totalHours += hours;
    items.push({
      id: 'addon_anim',
      category: 'Interatividade & UX',
      description: 'Animações fluidas de scroll, microinterações e transições modernas de página',
      hours,
      hourlyRate,
      totalCost: hours * hourlyRate,
      suggestedValue: 0,
    });
  }

  // 7. Multi-language Support
  if (input.includeMultiLanguage) {
    const hours = 12;
    totalHours += hours;
    items.push({
      id: 'addon_i18n',
      category: 'Internacionalização',
      description: 'Estrutura bilíngue (Português / Inglês) com seletor de idiomas',
      hours,
      hourlyRate,
      totalCost: hours * hourlyRate,
      suggestedValue: 0,
    });
  }

  const internalCost = totalHours * hourlyRate;

  // Margin calculation: Price = Cost / (1 - (margin + risk))
  const marginDivisor = Math.max(0.2, 1 - (targetMargin + riskReserve));
  let calculatedBasePrice = internalCost / marginDivisor;

  // Apply urgency multiplier
  let suggestedPrice = Math.round((calculatedBasePrice * urgencyMultiplier) / 10) * 10;

  // Apply minimum sales floor
  if (suggestedPrice < minPriceFloor) {
    suggestedPrice = minPriceFloor;
  }

  // Minimum break-even floor (cost + risk)
  const minPrice = Math.round(internalCost * (1 + riskReserve) * urgencyMultiplier);
  const profitMarginValue = suggestedPrice - internalCost;

  // Distribute proportional suggested value across items
  items.forEach(item => {
    item.suggestedValue = Math.round((item.totalCost / internalCost) * suggestedPrice);
  });

  // Calculate payment plans
  const paymentPlans: PaymentPlanOption[] = [
    {
      type: 'cash_discount',
      title: 'À Vista (PIX / Transferência)',
      installments: 1,
      installmentValue: Math.round(suggestedPrice * 0.9), // 10% discount
      totalValue: Math.round(suggestedPrice * 0.9),
      discountOrFeeDescription: '10% de desconto à vista na aprovação',
    },
    {
      type: 'split_entry_balance',
      title: 'Entrada + Saldo na Entrega',
      installments: 2,
      installmentValue: Math.round(suggestedPrice * 0.5),
      totalValue: suggestedPrice,
      discountOrFeeDescription: '50% de entrada no início + 50% após aprovação final',
    },
    {
      type: 'installments_3x',
      title: 'Parcelado em 3x Sem Juros',
      installments: 3,
      installmentValue: Math.round((suggestedPrice / 3) * 100) / 100,
      totalValue: suggestedPrice,
      discountOrFeeDescription: 'Sem acréscimo (Entrada + 30d + 60d)',
    },
    {
      type: 'installments_6x',
      title: 'Parcelado em 6x no Cartão',
      installments: 6,
      installmentValue: Math.round(((suggestedPrice * 1.08) / 6) * 100) / 100,
      totalValue: Math.round(suggestedPrice * 1.08),
      discountOrFeeDescription: 'Taxa operacional facilitada em 6 parcelas',
    },
  ];

  const auditFormula = `Custo Interno = ${totalHours}h x R$ ${hourlyRate}/h = R$ ${internalCost.toFixed(2)}. Preço Sugerido = R$ ${internalCost.toFixed(2)} ÷ [1 - (${(targetMargin * 100).toFixed(0)}% margem + ${(riskReserve * 100).toFixed(0)}% risco)] x ${urgencyMultiplier.toFixed(2)} (urgência) = R$ ${suggestedPrice.toFixed(2)}.`;

  return {
    projectType: input.projectType,
    totalHours,
    hourlyRate,
    internalCost,
    riskReservePercent: riskReserve,
    targetMarginPercent: targetMargin,
    urgencyMultiplier,
    minPrice,
    suggestedPrice,
    profitMarginValue,
    items,
    paymentPlans,
    auditFormula,
  };
};
