import crypto from 'crypto';

export interface ProposalInput {
  clientName: string;
  companyName: string;
  companyCnpj?: string;
  city: string;
  projectTitle: string;
  projectType: string;
  totalValue: number;
  paymentPlanChosen: string;
  estimatedDays: number;
  scopeItems: string[];
  pagesList: string[];
}

export interface ProposalSection {
  number: number;
  title: string;
  content: string;
}

export interface GeneratedProposal {
  proposalCode: string;
  publicToken: string;
  validUntil: string;
  sections: ProposalSection[];
  totalValue: number;
}

export const generateCompleteProposal = (input: ProposalInput): GeneratedProposal => {
  const proposalCode = `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const publicToken = `prop_${crypto.randomBytes(16).toString('hex')}`;
  
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 15);
  const validUntil = validUntilDate.toISOString().split('T')[0];

  const sections: ProposalSection[] = [
    {
      number: 1,
      title: 'Capa & Apresentação',
      content: `PROPOSTA COMERCIAL E TÉCNICA DE DESENVOLVIMENTO WEB\nCódigo: ${proposalCode}\nProjeto: ${input.projectTitle}\nPreparado para: ${input.companyName}\nEmissão: ${new Date().toLocaleDateString('pt-BR')}\nValidade: 15 dias corridos (${validUntil})`,
    },
    {
      number: 2,
      title: 'Identificação das Partes',
      content: `CONTRATADA: Praxis Digital Studio, agência de tecnologia e desenvolvimento de interfaces de alta performance.\nCONTRATANTE: ${input.companyName}${input.companyCnpj ? ` (CNPJ: ${input.companyCnpj})` : ''}, com sede em ${input.city} - Brasil, representada neste ato por ${input.clientName}.`,
    },
    {
      number: 3,
      title: 'Diagnóstico e Resumo Executivo',
      content: `O mercado atual exige que marcas de destaque possuam um ponto focal digital que transmita autoridade incontestável, velocidade instantânea de carregamento e facilidade de contato. Esta proposta detalha o desenvolvimento do novo ecossistema web da ${input.companyName}, transformando visitantes casuais em clientes qualificados.`,
    },
    {
      number: 4,
      title: 'Objetivos Estratégicos do Projeto',
      content: `1. Estabelecer canal institucional oficial de autoridade em ${input.city}.\n2. Maximizar a taxa de conversão direta via botão de contato no WhatsApp.\n3. Garantir experiência impecável e responsiva em 100% dos smartphones e computadores.\n4. Otimizar a visibilidade orgânica inicial em mecanismos de busca (Google).`,
    },
    {
      number: 5,
      title: 'Solução Técnica Proposta',
      content: `Desenvolvimento de aplicação web moderna construída sobre arquitetura estática/JAMstack ultrarrápida (React, Tailwind CSS, TypeScript). A solução elimina custos com servidores pesados, não exige plugins vulneráveis e oferece carregamento inferior a 1,2 segundos em redes móveis brasileiras.`,
    },
    {
      number: 6,
      title: 'Arquitetura da Informação & Páginas',
      content: `O projeto contemplará a seguinte estrutura de páginas e seções acordadas:\n${input.pagesList.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}`,
    },
    {
      number: 7,
      title: 'Funcionalidades & Recursos Técnicos',
      content: `• Design 100% responsivo para celulares, tablets e desktops;\n• Integração direta com canal comercial de WhatsApp com mensagem contextualizada;\n• Otimização semântica de SEO On-page com OpenGraph e Schema.org;\n• Certificado de Segurança SSL (HTTPS) incluso;\n• Formulário de contato inteligente com validação;\n• Acessibilidade visual com tipografia legível e contraste balanceado.`,
    },
    {
      number: 8,
      title: 'Entregáveis do Projeto',
      content: `1. Código-fonte completo do projeto;\n2. Publicação e configuração no domínio oficial da empresa;\n3. Acesso ao Portal Exclusivo do Cliente para acompanhamento e envio de arquivos;\n4. Guia simples de uso e orientações técnicas de manutenção.`,
    },
    {
      number: 9,
      title: 'Metodologia de Desenvolvimento',
      content: `Trabalhamos com metodologia ágil orientada por marcos de validação (Milestones). O cliente acompanha o progresso real através do Portal do Cliente da Praxis, garantindo transparência em cada fase sem necessidade de reuniões burocráticas exaustivas.`,
    },
    {
      number: 10,
      title: 'Cronograma e Prazos por Fase',
      content: `Prazo Total Estimado: ${input.estimatedDays} dias úteis a partir do recebimento dos materiais essenciais.\n• Fase 1 - Briefing & Planejamento: 3 dias úteis\n• Fase 2 - Design & Wireframe Estruturado: 5 dias úteis\n• Fase 3 - Desenvolvimento & Integrações: 7 dias úteis\n• Fase 4 - Testes, Revisão e Homologação: 3 dias úteis\n• Fase 5 - Publicação no Domínio Oficial: 2 dias úteis`,
    },
    {
      number: 11,
      title: 'Investimento e Composição de Custos',
      content: `O valor global do investimento para o escopo integral descrito nesta proposta é de R$ ${input.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.\nEste valor contempla desenvolvimento, design, testes, otimizações iniciais e publicação.`,
    },
    {
      number: 12,
      title: 'Condições e Formas de Pagamento',
      content: `Condição Selecionada: ${input.paymentPlanChosen}.\nPagamentos aceitos via PIX (chave bancária fornecida na confirmação) ou parcelamento via cartão de crédito conforme plano acordado.`,
    },
    {
      number: 13,
      title: 'Política de Revisões e Ajustes',
      content: `Estão inclusas 2 (duas) rodadas completas de revisão e refinamento antes do encerramento final do projeto. Alterações que não modifiquem a arquitetura de informação previamente aprovada serão atendidas sem custos adicionais.`,
    },
    {
      number: 14,
      title: 'Responsabilidades do Contratante',
      content: `Fornecer os materiais institucionais (logotipo vetorial, textos de apoio, fotos de boa resolução) através do Portal do Cliente dentro do prazo de até 7 dias úteis após a contratação, e validar as etapas de homologação em até 48 horas úteis após notificação.`,
    },
    {
      number: 15,
      title: 'Exclusões Claras de Escopo',
      content: `Não fazem parte deste escopo: desenvolvimento de aplicativos móveis nativos (iOS/Android), integração com softwares ERP de terceiros sem APIs abertas, compra de fotografias pagas de terceiros e gerenciamento contínuo de tráfego pago (Google Ads / Meta Ads).`,
    },
    {
      number: 16,
      title: 'Custos Externos',
      content: `• Registro de Domínio próprio (.com.br): Aprox. R$ 40,00 anuais pagos diretamente ao Registro.br pelo contratante.\n• Hospedagem de Alta Performance: Gratuita através dos planos Cloudflare / Vercel, mantendo custo mensal de R$ 0,00 para a infraestrutura do site.`,
    },
    {
      number: 17,
      title: 'Prazo de Validade da Proposta',
      content: `Esta proposta e suas condições comerciais têm validade de 15 (quinze) dias corridos a contar da data de emissão. Decorrido este período, os prazos e valores poderão ser reajustados para novos agendamentos na fila de produção.`,
    },
    {
      number: 18,
      title: 'Termos de Confidencialidade e LGPD',
      content: `As partes comprometem-se a manter sob sigilo absoluto todas as informações operacionais, comerciais e estratégicas trocadas durante o desenvolvimento. O tratamento de dados pessoais observará estritamente os termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
    },
    {
      number: 19,
      title: 'Termo de Aceite Formal',
      content: `Ao aceitar digitalmente esta proposta no Portal do Cliente, a ${input.companyName} aprova integralmente os termos, escopo e investimentos estipulados, autorizando o início dos trabalhos e emissão do primeiro faturamento.`,
    },
  ];

  return {
    proposalCode,
    publicToken,
    validUntil,
    sections,
    totalValue: input.totalValue,
  };
};

export const createDigitalSignatureHash = (
  proposalCode: string,
  clientName: string,
  ipAddress: string,
  timestamp: string
): string => {
  return crypto
    .createHash('sha256')
    .update(`${proposalCode}:${clientName}:${ipAddress}:${timestamp}:PRAXIS_VERIFIED`)
    .digest('hex');
};
