export interface ImagePromptCard {
  id: string;
  targetPage: string;
  targetSection: string;
  title: string;
  purpose: string;
  promptText: string;
  photographicStyle: string;
  aspectRatio: '16:9' | '1:1' | '4:3' | '9:16';
  composition: string;
  negativePrompt: string;
}

export interface PromptBundleResult {
  masterPrompt: string;
  pagePrompts: Array<{ pageName: string; prompt: string }>;
  imagePrompts: ImagePromptCard[];
}

export const generateSiteAndImagePrompts = (
  companyName: string,
  niche: string,
  city: string,
  briefingAnswers: Record<string, string>
): PromptBundleResult => {
  const history = briefingAnswers['empresa_historia'] || 'Empresa de tradição com foco em atendimento personalizado.';
  const differentials = briefingAnswers['empresa_diferenciais'] || 'Pontualidade, equipe experiente e atendimento humanizado.';
  const targetAudience = briefingAnswers['empresa_publico'] || 'Clientes exigentes que valorizam qualidade e transparência.';
  const servicesList = briefingAnswers['servicos_lista'] || 'Consultoria, Atendimento Especializado, Soluções Rápidas.';
  const colors = briefingAnswers['branding_cores'] || 'Azul corporativo (#1E3A8A) e toques modernos de ciano';

  // 1. Master Software Engineering Prompt
  const masterPrompt = `================================================================================
PRAXIS MASTER PROMPT DE ENGENHARIA DE SOFTWARE
PROJETO: Website Oficial de Alta Conversão — ${companyName}
NICHO: ${niche.toUpperCase()} | LOCALIZAÇÃO: ${city.toUpperCase()} - BRASIL
================================================================================

# 1. OBJETIVO & CONTEXTO EMPRESARIAL
Você é um desenvolvedor full-stack e arquiteto de software sênior. Sua missão é construir o website oficial completo, ultra-rápido e responsivo para a empresa "${companyName}", sediada em ${city} - Brasil.
- História & Posicionamento: ${history}
- Diferenciais de Mercado: ${differentials}
- Público-Alvo: ${targetAudience}
- Paleta e Identidade Visual: ${colors}

# 2. DIRETRIZES TÉCNICAS E ARQUITETURA
- Framework: React com TypeScript e Tailwind CSS.
- Princípios de Engenharia:
  * Componentes modulares, tipados e reutilizáveis.
  * Zero dependências desnecessárias ou bibliotecas de runtime pesadas.
  * Acessibilidade completa (WCAG 2.1 AA): contraste mínimo de 4.5:1, tags semânticas (<header>, <nav>, <main>, <section>, <footer>), atributos aria-label em botões de ícone.
  * SEO On-Page Rigoroso: meta tags OpenGraph, Twitter Cards, JSON-LD Schema.org (tipo LocalBusiness) com endereço e telefone.
  * Performance: pontuação mínima esperada de 95+ no Lighthouse Mobile, Core Web Vitals otimizados (LCP < 1.5s, CLS < 0.05).
  * Canal de Conversão: Botão flutuante e chamadas de ação (CTAs) estrategicamente posicionadas conectadas ao WhatsApp comercial via link direto seguro: https://wa.me/55...

# 3. ESTRUTURA DE PÁGINAS E SEÇÕES OBRIGATÓRIAS
- Header Fixo com logotipo, links de navegação suave (scroll suave) e botão CTA principal.
- Hero Section de alto impacto com proposta de valor clara em menos de 5 segundos de leitura.
- Seção de Prova Social & Autoridade com estatísticas, anos de atuação e avaliações.
- Grade de Serviços Especializados:
${servicesList.split('\n').map(s => `  * ${s.trim()}`).filter(Boolean).join('\n')}
- Seção Sobre Nós / História com ênfase no atendimento humanizado.
- Perguntas Frequentes (FAQ) com sanfona (accordion) interativa acessível por teclado.
- Rodapé Institucional Completo com horário de atendimento, endereço físico em ${city}, mapa integrado e links legais.

# 4. CRITÉRIOS DE ACEITAÇÃO
1. Responsividade impecável testada em 360px, 768px, 1024px e 1440px.
2. Nenhum elemento de texto fictício ("Lorem Ipsum") em produção; utilize apenas textos reais com copy persuasiva.
3. Tratamento de carregamento e fallback para todas as imagens.`;

  // 2. Modular Page Prompts
  const pagePrompts = [
    {
      pageName: 'Página Inicial (Home / Landing)',
      prompt: `Crie a página inicial completa de ${companyName} com Hero Section de alto impacto, Proposta Única de Valor, Seletor rápido de serviços e botões de agendamento online. Paleta: ${colors}.`,
    },
    {
      pageName: 'Catálogo de Serviços',
      prompt: `Desenvolva a seção detalhada de serviços para ${companyName}. Cada serviço deve apresentar título, descrição dos benefícios para o cliente, tempo médio de execução e CTA individual de 'Solicitar Orçamento'. Serviços a incluir: ${servicesList}.`,
    },
    {
      pageName: 'Sobre a Empresa & Equipe',
      prompt: `Construa a seção institucional narrando a história de ${companyName} com base em: "${history}". Enfatize os diferenciais: "${differentials}". Inclua cards da equipe técnica com mini-biografias e selos de qualificação.`,
    },
    {
      pageName: 'Contato & Localização',
      prompt: `Implemente o formulário de contato com validação no cliente (nome, telefone, serviço desejado, mensagem) e integração direta com WhatsApp. Exiba endereço em ${city}, horários de funcionamento e mapa interativo.`,
    },
  ];

  // 3. Image Prompt Cards (Art Direction & Negative Prompts)
  const imagePrompts: ImagePromptCard[] = [
    {
      id: 'img_hero_main',
      targetPage: 'Home',
      targetSection: 'Hero Banner',
      title: 'Fotografia Principal do Hero',
      purpose: 'Transmitir autoridade, ambiente premium e confiança imediata ao visitante',
      promptText: `Professional authentic photography of modern high-end ${niche} establishment in ${city}, beautiful clean architectural interior, friendly professional specialist greeting a client, natural soft morning lighting streaming through large glass windows, cinematic depth of field, 8k resolution, captured with Hasselblad 50mm f/1.8 lens.`,
      photographicStyle: 'Editorial / Arquitetura e Retrato Comercial Autêntico',
      aspectRatio: '16:9',
      composition: 'Regra dos terços com espaço negativo à esquerda para sobreposição de tipografia e botões CTA.',
      negativePrompt: 'no text, no watermark, no logo overlays, no plastic skin, no distorted hands, no exaggerated CGI smiles, no low quality, no blur.',
    },
    {
      id: 'img_services_ambient',
      targetPage: 'Serviços',
      targetSection: 'Grade de Especialidades',
      title: 'Close de Atendimento Especializado',
      purpose: 'Demonstrar precisão técnica e cuidado nos detalhes',
      promptText: `Macro editorial detail shot of specialized high-precision equipment and hands of a skilled professional working in ${niche}, clean minimalist workspace, subtle natural reflection, shallow depth of field, warm inviting tones, high dynamic range.`,
      photographicStyle: 'Macro Fotografia Editorial / Close Técnico',
      aspectRatio: '4:3',
      composition: 'Foco seletivo no centro com desfoque elegante (bokeh) no plano de fundo.',
      negativePrompt: 'no text, no blurry subjects, no artificial saturated neon colors, no distorted objects.',
    },
    {
      id: 'img_team_about',
      targetPage: 'Sobre Nós',
      targetSection: 'História & Equipe',
      title: 'Retrato da Equipe / Fundador',
      purpose: 'Humanizar a marca e gerar identificação empática com o consumidor regional',
      promptText: `Warm approachable portrait of a Brazilian professional specialist in ${niche}, smiling naturally at the camera in a modern comfortable clinic/office environment in ${city}, smart casual professional attire, soft ambient lighting, clean background.`,
      photographicStyle: 'Retrato Corporativo Humanizado',
      aspectRatio: '1:1',
      composition: 'Enquadramento fechado no busto (médio-close) com iluminação suave de três pontos.',
      negativePrompt: 'no harsh shadows, no corporate stiffness, no cartoon look, no text, no unnatural skin smoothing.',
    },
  ];

  return {
    masterPrompt,
    pagePrompts,
    imagePrompts,
  };
};
