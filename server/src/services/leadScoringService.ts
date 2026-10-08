export interface ScoreCriteria {
  rule: string;
  points: number;
  maxPoints: number;
  status: 'passed' | 'failed' | 'warning';
  explanation: string;
}

export interface ScoreResult {
  totalScore: number;
  priority: 'baixa' | 'moderado' | 'alta' | 'estrategico';
  criteriaBreakdown: ScoreCriteria[];
  summary: string;
}

export interface LeadScoreInput {
  hasWebsite?: boolean;
  website?: string;
  hasHttps?: boolean;
  isResponsive?: boolean;
  phone?: string;
  email?: string;
  instagram?: string;
  niche?: string;
  companyName?: string;
}

const HIGH_TICKET_NICHES = [
  'odontologia',
  'clinica',
  'medicina',
  'advocacia',
  'arquitetura',
  'engenharia',
  'cirurgia',
  'contabilidade',
  'estetica',
  'dermatologia',
];

export const calculateLeadScore = (input: LeadScoreInput): ScoreResult => {
  const criteria: ScoreCriteria[] = [];
  let score = 0;

  // 1. Necessidade de Presença Digital (Site Inexistente ou Inadequado)
  if (!input.hasWebsite && !input.website) {
    score += 40;
    criteria.push({
      rule: 'Ausência Total de Website Oficial',
      points: 40,
      maxPoints: 40,
      status: 'passed',
      explanation: 'A empresa opera sem website oficial próprio, gerando urgência comercial máxima para fechamento de site institucional.',
    });
  } else {
    // Possui site, vamos avaliar qualidade técnica
    const hasHttps = input.hasHttps ?? (input.website?.startsWith('https://') || false);
    if (!hasHttps) {
      score += 20;
      criteria.push({
        rule: 'Website Existente Sem Certificado SSL (HTTP)',
        points: 20,
        maxPoints: 20,
        status: 'warning',
        explanation: 'O site existente não possui conexão segura HTTPS, causando alertas de segurança nos navegadores e perda de credibilidade.',
      });
    } else {
      criteria.push({
        rule: 'Website Existente com SSL Ativo',
        points: 5,
        maxPoints: 20,
        status: 'failed',
        explanation: 'A empresa já possui certificado de segurança ativo no site.',
      });
    }

    const isResponsive = input.isResponsive ?? false;
    if (!isResponsive) {
      score += 20;
      criteria.push({
        rule: 'Deficiência de Responsividade / Mobile',
        points: 20,
        maxPoints: 20,
        status: 'warning',
        explanation: 'O site existente apresenta falhas de usabilidade em celulares, principal canal de acesso de novos clientes.',
      });
    }
  }

  // 2. Disponibilidade de Canais Comerciais Diretos
  if (input.phone) {
    score += 15;
    criteria.push({
      rule: 'Telefone / WhatsApp Comercial Disponível',
      points: 15,
      maxPoints: 15,
      status: 'passed',
      explanation: 'Canal de contato imediato cadastrado, viabilizando abordagem direta via WhatsApp ou ligação.',
    });
  } else {
    criteria.push({
      rule: 'Telefone Comercial Não Identificado',
      points: 0,
      maxPoints: 15,
      status: 'failed',
      explanation: 'Ausência de número telefônico público reduz a velocidade de contato direto.',
    });
  }

  if (input.email) {
    score += 10;
    criteria.push({
      rule: 'E-mail Comercial Registrado',
      points: 10,
      maxPoints: 10,
      status: 'passed',
      explanation: 'Canal formal disponível para envio de propostas comerciais detalhadas em PDF.',
    });
  }

  if (input.instagram) {
    score += 10;
    criteria.push({
      rule: 'Presença Ativa em Rede Social (Instagram)',
      points: 10,
      maxPoints: 10,
      status: 'passed',
      explanation: 'A empresa valoriza sua imagem visual e já investe tempo na captação online, sendo receptiva a uma demonstração profissional.',
    });
  }

  // 3. Nicho de Alto Valor Agregado / Ticket Médio Elevado
  const nicheNormalized = (input.niche || '').toLowerCase();
  const isHighTicket = HIGH_TICKET_NICHES.some(n => nicheNormalized.includes(n));
  if (isHighTicket) {
    score += 15;
    criteria.push({
      rule: 'Nicho com Alto Ticket Médio e Margem Comercial',
      points: 15,
      maxPoints: 15,
      status: 'passed',
      explanation: `O segmento (${input.niche}) comercializa serviços de alto valor, onde um único cliente conquistado pelo site cobre com folga o investimento do projeto.`,
    });
  } else {
    score += 5;
    criteria.push({
      rule: 'Nicho Geral / Serviços Locais',
      points: 5,
      maxPoints: 15,
      status: 'passed',
      explanation: 'Segmento comercial padrão com demanda de posicionamento regional.',
    });
  }

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(0, score));

  let priority: 'baixa' | 'moderado' | 'alta' | 'estrategico';
  let summary = '';

  if (finalScore >= 85) {
    priority = 'estrategico';
    summary = 'Oportunidade Estratégica: Empresa em segmento de alto valor com demanda latente e canais diretos de contato prontos para abordagem com demonstração.';
  } else if (finalScore >= 65) {
    priority = 'alta';
    summary = 'Alta Prioridade: Forte necessidade de site e canais de contato ativos. Excelente taxa provável de resposta comercial.';
  } else if (finalScore >= 40) {
    priority = 'moderado';
    summary = 'Potencial Moderado: Possui canais ou carência digital parcial. Recomenda-se abordagem após enriquecimento de dados.';
  } else {
    priority = 'baixa';
    summary = 'Baixa Prioridade: Dados de contato incompletos ou presença digital já estruturada.';
  }

  return {
    totalScore: finalScore,
    priority,
    criteriaBreakdown: criteria,
    summary,
  };
};
