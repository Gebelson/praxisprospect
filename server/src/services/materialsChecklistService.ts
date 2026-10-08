export interface MaterialRequirementItem {
  id: string;
  category: 'logo' | 'text' | 'photo' | 'credential' | 'palette';
  description: string;
  isMandatory: boolean;
  responsible: 'client' | 'agency';
  status: 'pending' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'dismissed';
  solutionType?: string;
  solutionDetails?: string;
}

export const generateMaterialsChecklistFromBriefing = (
  answers: Record<string, string>
): MaterialRequirementItem[] => {
  const items: MaterialRequirementItem[] = [];

  // 1. Logotipo da Empresa
  const logoStatus = answers['branding_logo_status'];
  if (logoStatus === 'need_create') {
    items.push({
      id: 'req_logo',
      category: 'logo',
      description: 'Logotipo Vetorial ou em Alta Resolução (PNG sem fundo)',
      isMandatory: true,
      responsible: 'agency',
      status: 'pending',
      solutionType: 'logo_design_service',
      solutionDetails: 'Cliente não possui logo em vetor. Solução: Desenvolver vetorização/logomarca pela agência ou aplicar tipografia de precisão moderna.',
    });
  } else {
    items.push({
      id: 'req_logo',
      category: 'logo',
      description: 'Logotipo Vetorial Original (PDF, EPS, SVG ou PNG Transparente)',
      isMandatory: true,
      responsible: 'client',
      status: 'pending',
      solutionType: 'direct_upload',
      solutionDetails: 'Upload direto pelo Portal do Cliente na aba Arquivos.',
    });
  }

  // 2. Textos Institucionais & Descrição dos Serviços
  const textStatus = answers['conteudo_textos_status'];
  if (textStatus === 'need_create') {
    items.push({
      id: 'req_texts',
      category: 'text',
      description: 'Redação Completa das Páginas e Chamadas de Ação (Copywriting)',
      isMandatory: true,
      responsible: 'agency',
      status: 'pending',
      solutionType: 'copywriting_addon',
      solutionDetails: 'Cliente solicitou criação textual. Solução: A agência redigirá todos os textos a partir do formulário de história e diferenciais.',
    });
  } else {
    items.push({
      id: 'req_texts',
      category: 'text',
      description: 'Textos Institucionais e Descrições Específicas de Serviços',
      isMandatory: true,
      responsible: 'client',
      status: 'pending',
      solutionType: 'direct_text_or_doc',
      solutionDetails: 'Envio de documento (.docx/.pdf) ou inserção direta no briefing.',
    });
  }

  // 3. Fotografias e Imagens
  const photoStatus = answers['fotos_equipe_status'];
  if (photoStatus === 'need_create' || photoStatus === 'unknown') {
    items.push({
      id: 'req_photos',
      category: 'photo',
      description: 'Fotografias Profissionais Ambientadas',
      isMandatory: false,
      responsible: 'agency',
      status: 'pending',
      solutionType: 'curated_stock_library',
      solutionDetails: 'Cliente não possui ensaio profissional. Solução: Seleção curada de fotografias de banco de imagens gratuito (Unsplash/Pexels) com estética autêntica.',
    });
  } else {
    items.push({
      id: 'req_photos',
      category: 'photo',
      description: 'Fotografias em Alta Definição da Equipe e Estrutura Física',
      isMandatory: true,
      responsible: 'client',
      status: 'pending',
      solutionType: 'direct_upload',
      solutionDetails: 'Upload de até 15 fotos originais através do Portal do Cliente.',
    });
  }

  // 4. Domínio & Credenciais Técnicas
  items.push({
    id: 'req_domain',
    category: 'credential',
    description: 'Acesso ao Registro de Domínio (Registro.br ou Provedor DNS)',
    isMandatory: true,
    responsible: 'client',
    status: 'pending',
    solutionType: 'dns_pointer',
    solutionDetails: 'Configuração simples dos Nameservers da Cloudflare ou apontamento de registro CNAME/A.',
  });

  // 5. Paleta de Cores e Guia Visual
  items.push({
    id: 'req_palette',
    category: 'palette',
    description: 'Definição das Cores Primárias e Secundárias da Marca',
    isMandatory: false,
    responsible: 'agency',
    status: 'approved',
    solutionType: 'brand_palette_derivation',
    solutionDetails: answers['branding_cores']
      ? `Cores indicadas pelo cliente: ${answers['branding_cores']}`
      : 'Derivação automática da paleta pelo logotipo e nicho de atuação.',
  });

  return items;
};
