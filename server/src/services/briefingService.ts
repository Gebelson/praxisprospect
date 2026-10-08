export interface BriefingQuestionDefinition {
  id: string;
  step: number;
  stepTitle: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'select' | 'radio_status' | 'file';
  options?: string[];
  isRequired: boolean;
}

export const PRODUCTION_BRIEFING_STEPS: Array<{ step: number; title: string; description: string }> = [
  { step: 1, title: 'Dados Empresariais & História', description: 'Informações institucionais, história e diferenciais competitivos' },
  { step: 2, title: 'Identidade Visual & Branding', description: 'Logotipo, paleta de cores e preferências visuais' },
  { step: 3, title: 'Conteúdo, Serviços & Produtos', description: 'Textos essenciais, catálogo de serviços e formas de atendimento' },
  { step: 4, title: 'Fotografias & Recursos Visuais', description: 'Fotos da equipe, estrutura física e fotos de serviços' },
  { step: 5, title: 'Configurações Técnicas & Contato', description: 'Domínio, redes sociais, telefones comerciais e integrações' },
];

export const PRODUCTION_BRIEFING_QUESTIONS: BriefingQuestionDefinition[] = [
  // Step 1
  {
    id: 'empresa_historia',
    step: 1,
    stepTitle: 'Dados Empresariais & História',
    label: 'História e Fundação da Empresa',
    description: 'Como a empresa nasceu e qual é a trajetória até os dias de hoje?',
    type: 'textarea',
    isRequired: true,
  },
  {
    id: 'empresa_diferenciais',
    step: 1,
    stepTitle: 'Dados Empresariais & História',
    label: 'Principais Diferenciais Competitivos',
    description: 'O que faz um cliente escolher vocês em vez de um concorrente direto?',
    type: 'textarea',
    isRequired: true,
  },
  {
    id: 'empresa_publico',
    step: 1,
    stepTitle: 'Dados Empresariais & História',
    label: 'Perfil do Público-Alvo / Cliente Ideal',
    description: 'Quem é a pessoa que mais compra seus serviços? (Idade, perfil, dores principais)',
    type: 'textarea',
    isRequired: true,
  },

  // Step 2
  {
    id: 'branding_logo_status',
    step: 2,
    stepTitle: 'Identidade Visual & Branding',
    label: 'Disponibilidade de Logotipo em Alta Resolução / Vetor',
    description: 'Você possui o arquivo do logotipo original (PDF, EPS, Illustrator ou PNG sem fundo)?',
    type: 'radio_status',
    options: ['already_have', 'need_create', 'unknown', 'send_later'],
    isRequired: true,
  },
  {
    id: 'branding_cores',
    step: 2,
    stepTitle: 'Identidade Visual & Branding',
    label: 'Cores Oficiais da Marca ou Preferência de Paleta',
    description: 'Ex: Azul marinho e dourado, Verde esmeralda e branco, etc.',
    type: 'text',
    isRequired: false,
  },
  {
    id: 'branding_referencias',
    step: 2,
    stepTitle: 'Identidade Visual & Branding',
    label: 'Sites de Referência que Você Admira',
    description: 'Links de sites que você gosta da estética, cores ou formato de navegação.',
    type: 'textarea',
    isRequired: false,
  },

  // Step 3
  {
    id: 'servicos_lista',
    step: 3,
    stepTitle: 'Conteúdo, Serviços & Produtos',
    label: 'Lista dos Principais Serviços / Produtos',
    description: 'Descreva os 3 a 6 serviços mais importantes que devem ter destaque no site.',
    type: 'textarea',
    isRequired: true,
  },
  {
    id: 'conteudo_textos_status',
    step: 3,
    stepTitle: 'Conteúdo, Serviços & Produtos',
    label: 'Disponibilidade dos Textos Institucionais e Descrições',
    description: 'Os textos das páginas já estão redigidos ou precisará de redação profissional pela agência?',
    type: 'radio_status',
    options: ['already_have', 'need_create', 'unknown', 'send_later'],
    isRequired: true,
  },
  {
    id: 'depoimentos_clientes',
    step: 3,
    stepTitle: 'Conteúdo, Serviços & Produtos',
    label: 'Depoimentos Reais de Clientes / Avaliações',
    description: 'Envie 2 ou 3 relatos autorizados ou notas de avaliações do Google da sua empresa.',
    type: 'textarea',
    isRequired: false,
  },

  // Step 4
  {
    id: 'fotos_equipe_status',
    step: 4,
    stepTitle: 'Fotografias & Recursos Visuais',
    label: 'Fotografias Profissionais da Equipe e Estrutura',
    description: 'Possui fotos em boa resolução da fachada, ambiente interno ou profissionais?',
    type: 'radio_status',
    options: ['already_have', 'need_create', 'unknown', 'send_later'],
    isRequired: true,
  },

  // Step 5
  {
    id: 'tecnica_dominio',
    step: 5,
    stepTitle: 'Configurações Técnicas & Contato',
    label: 'Nome de Domínio Desejado ou Já Registrado',
    description: 'Ex: www.suaempresa.com.br (Se já tiver registrado, indique onde está)',
    type: 'text',
    isRequired: true,
  },
  {
    id: 'tecnica_whatsapp',
    step: 5,
    stepTitle: 'Configurações Técnicas & Contato',
    label: 'Número do WhatsApp Comercial para Recebimento de Mensagens',
    description: 'Número com DDD para o qual os botões do site encaminharão os clientes.',
    type: 'text',
    isRequired: true,
  },
  {
    id: 'tecnica_horarios',
    step: 5,
    stepTitle: 'Configurações Técnicas & Contato',
    label: 'Horário de Funcionamento e Endereço Físico Completo',
    description: 'Informações que devem constar no rodapé e página de contato.',
    type: 'textarea',
    isRequired: true,
  },
];

export const COMMERCIAL_BRIEFING_QUESTIONS: BriefingQuestionDefinition[] = [
  {
    id: 'comm_empresa',
    step: 1,
    stepTitle: 'Diagnóstico Rápido',
    label: 'Nome da Empresa e Ramo de Atuação',
    description: 'Segmento e especialidade do seu negócio',
    type: 'text',
    isRequired: true,
  },
  {
    id: 'comm_objetivo',
    step: 1,
    stepTitle: 'Diagnóstico Rápido',
    label: 'Qual o Principal Objetivo do Novo Site?',
    description: 'Ex: Gerar contatos no WhatsApp, vender online, passar credibilidade para grandes clientes',
    type: 'textarea',
    isRequired: true,
  },
  {
    id: 'comm_problema_atual',
    step: 1,
    stepTitle: 'Diagnóstico Rápido',
    label: 'Qual o Maior Desafio Atual da Sua Presença Online?',
    description: 'Não tem site, o site antigo é feio/lento, ou não recebe mensagens?',
    type: 'textarea',
    isRequired: true,
  },
  {
    id: 'comm_prazo',
    step: 1,
    stepTitle: 'Diagnóstico Rápido',
    label: 'Existe uma Data Limite ou Prazo Desejado para Lançamento?',
    description: 'Ex: Próximos 15 dias, 1 mês, lançamento de novo produto',
    type: 'text',
    isRequired: false,
  },
];
