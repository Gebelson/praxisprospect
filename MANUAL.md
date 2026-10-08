# PRAXIS — Manual Completo de Operação da Agência

> Guia prático para operar uma agência digital completa com R$ 0 de custos recorrentes obrigatórios.

---

## 📑 Índice
1. [Visão Geral e Filosofia Operacional](#1-visão-geral-e-filosofia-operacional)
2. [Estrutura do Ambiente e Inicialização](#2-estrutura-do-ambiente-e-inicialização)
3. [Módulo 1: Captação e Prospecção Inteligente](#3-módulo-1-captação-e-prospecção-inteligente)
4. [Módulo 2: CRM e Qualificação de Oportunidades](#4-módulo-2-crm-e-qualificação-de-oportunidades)
5. [Módulo 3: Scripts de Abordagem Multicanal (1-Click)](#5-módulo-3-scripts-de-abordagem-multicanal-1-click)
6. [Módulo 4: Gerador de Sites Demonstrativos e Previews](#6-módulo-4-gerador-de-sites-demonstrativos-e-previews)
7. [Módulo 5: Orçamentos e Engenharia de Preços](#7-módulo-5-orçamentos-e-engenharia-de-preços)
8. [Módulo 6: Propostas Formais com Assinatura Digital SHA-256](#8-módulo-6-propostas-formais-com-assinatura-digital-sha-256)
9. [Módulo 7: Gestão de Projetos e Kanbans de Entrega](#9-módulo-7-gestão-de-projetos-e-kanbans-de-entrega)
10. [Módulo 8: Briefing Comercial e de Produção](#10-módulo-8-briefing-comercial-e-de-produção)
11. [Módulo 9: Portal do Cliente e Envio Seguro de Materiais](#11-módulo-9-portal-do-cliente-e-envio-seguro-de-materiais)
12. [Módulo 10: Compilador de Prompts Mestre para IA](#12-módulo-10-compilador-de-prompts-mestre-para-ia)
13. [Módulo 11: Automações e Fila do Agente Local Antigravity](#13-módulo-11-automações-e-fila-do-agente-local-antigravity)
14. [Módulo 12: Gestão Financeira e Relatórios de Desempenho](#14-módulo-12-gestão-financeira-e-relatórios-de-desempenho)
15. [Rotinas de Backup, Segurança e Restauração](#15-rotinas-de-backup-segurança-e-restauração)

---

## 1. Visão Geral e Filosofia Operacional

O **PRAXIS** foi projetado para permitir que um profissional solo atue com a capacidade de entrega de uma agência de 5 pessoas. 

### Pilares de Custo Zero:
1. **Sem assinaturas obrigatórias**: Nada de ferramentas pagas de automação (Zapier/Make), CRM pago (HubSpot) ou scraping caro.
2. **Sem APIs pagas obrigatórias**: A plataforma utiliza fontes públicas e gratuitas (OpenStreetMap Overpass API com cache local), algoritmos determinísticos e heurísticas consolidadas.
3. **Persistência Local e ACID**: O banco de dados é um arquivo único `data/praxis.db` no formato SQLite com WAL mode, sem custos de hospedagem de banco gerenciado.
4. **Agente em Segundo Plano**: Utiliza o poder do seu próprio computador (e as ferramentas do Google Antigravity instaladas localmente) para tarefas de geração de código e auditorias.

---

## 2. Estrutura do Ambiente e Inicialização

### Iniciar o Sistema no Dia a Dia:
Abra um terminal no diretório do projeto e execute:
```bash
npm run dev
```
Isso iniciará:
- Backend REST na porta **3001**
- Frontend Administrativo na porta **5173**

Para ativar o processamento em segundo plano do agente na sua máquina:
Abra um segundo terminal e execute:
```bash
npm run dev:agent
```

No seu navegador, abra [http://localhost:5173](http://localhost:5173).

### Atalho Rápido Global (Ctrl+K):
A qualquer momento, pressione `Ctrl+K` para abrir a **Paleta de Comandos**. Você pode pesquisar qualquer Lead, Cliente, Projeto, Proposta ou navegar instantaneamente entre qualquer um dos 15 módulos.

---

## 3. Módulo 1: Captação e Prospecção Inteligente

1. Clique em **Captação** no menu lateral.
2. Escolha o nicho desejado (ex.: *Odontologia*, *Barbearia*, *Restaurante*, *Advocacia*) e informe a cidade (ex.: *São Paulo*, *Campinas*, *Curitiba*).
3. Marque os filtros:
   - "Somente sem site identificado"
   - "Com telefone disponível"
4. Clique em **Descobrir Empresas**.
5. O sistema consultará a Overpass API do OpenStreetMap de forma legal e ética. Se a rede externa demorar, o motor ativará a base local aberta instantaneamente.
6. A tabela listará as empresas encontradas com seu **Score Comercial (0 a 100)** já calculado.
7. Clique em **Importar para CRM** para transformar os registros selecionados em oportunidades no seu funil de vendas.

---

## 4. Módulo 2: CRM e Qualificação de Oportunidades

1. Acesse o menu **Leads**.
2. Visualize o pipeline nas etapas:
   - *Descoberto* -> *Qualificado* -> *Abordado* -> *Em Negociação* -> *Proposta Enviada* -> *Ganho* / *Perdido*.
3. Clique em qualquer lead para ver a ficha completa com:
   - Diagnóstico técnico preliminar (presença de HTTPS, responsividade mobile).
   - Fatores de pontuação comercial.
   - Histórico de contatos realizados.
4. Quando uma negociação evoluir para fechamento, o sistema converte o Lead em **Cliente Oficial** e já prepara o link exclusivo do **Portal do Cliente**.

---

## 5. Módulo 3: Scripts de Abordagem Multicanal (1-Click)

O PRAXIS elimina o bloqueio criativo na hora de iniciar conversas com tomadores de decisão:
1. Vá até o menu **Mensagens**.
2. Selecione o modelo de script:
   - *Primeiro Contato - Abordagem Consultiva com Site Demonstração*
   - *Follow-up 48h - Quebra de Objeção e Valor*
   - *Apresentação de Proposta Técnica*
3. Os dados do lead e da sua agência são injetados automaticamente no texto.
4. Você conta com botões de disparo direto:
   - **Abrir no WhatsApp Web**: Monta a URL `api.whatsapp.com/send?phone=...&text=...` já codificada.
   - **Copiar e Abrir Instagram**: Copia o pitch para a área de transferência e abre o perfil da empresa no Instagram.
   - **Enviar por E-mail**: Abre o cliente de e-mail padrão já com assunto e corpo preenchidos.
5. Cada envio pode ser registrado automaticamente no histórico do CRM com um clique.

---

## 6. Módulo 4: Gerador de Sites Demonstrativos e Previews

Uma das estratégias de maior conversão é demonstrar ao cliente como o site dele ficaria antes mesmo dele contratar:
1. Acesse **Gerador de Sites**.
2. Selecione o nicho desejado e o nome da empresa do lead.
3. Clique em **Gerar Site Demonstração**.
4. O motor compilará um site responsivo moderno com seções completas:
   - Hero com chamada de ação e agendamento.
   - Grid de serviços e diferenciais.
   - Prova social e depoimentos.
   - Rodapé com dados de contato.
   - **Tarja de Advertência Obrigatória**: Todo site de demonstração exibe o aviso claro: *"PROPOSTA DE CONCEITO VISUAL E TÉCNICO DESENVOLVIDA POR [SUA AGÊNCIA]. ESTE SITE É UMA DEMONSTRAÇÃO NÃO OFICIAL."*
5. Clique em **Abrir Demonstração** para visualizar em tela cheia e enviar o link ao prospect.

---

## 7. Módulo 5: Orçamentos e Engenharia de Preços

Nunca mais cobre "no chute" ou tome prejuízo:
1. Vá até o menu **Orçamentos**.
2. Informe o tipo de projeto (Landing Page, Institucional, Loja Virtual).
3. A calculadora calculará automaticamente:
   - Horas de desenvolvimento x Custo/hora base.
   - Margem de lucro líquida configurada (ex.: 40%).
   - Impostos municipais/nacionais (ex.: 6%).
   - Preço de piso inegociável.
4. O sistema gera 3 cenários de pagamento pré-configurados:
   - **À Vista**: Com desconto calculado (ex.: 5% a 10%).
   - **Parcelado 2x**: Entrada de 50% + 50% na entrega.
   - **Recorrente**: Implantação reduzida + mensalidade de manutenção/hospedagem.

---

## 8. Módulo 6: Propostas Formais com Assinatura Digital SHA-256

1. Acesse **Propostas**.
2. Selecione o orçamento aprovado e clique em **Gerar Proposta**.
3. O PRAXIS compila o documento contratual completo com **19 cláusulas jurídicas**:
   - Objeto, Escopo e Entregáveis.
   - Prazos e Cronograma de Fases.
   - Condições de Pagamento e Inadimplência.
   - Responsabilidades da Contratante (fornecimento de fotos, textos e logomarca).
   - Política de Rodadas de Revisão.
   - Direitos Autorais e Propriedade Intelectual pós-quitação.
   - LGPD e Proteção de Dados.
   - Limitação de Responsabilidade e Foro.
4. **Aceite Digital Seguro**:
   - O link da proposta pode ser compartilhado diretamente ou acessado pelo cliente no Portal do Cliente.
   - Ao clicar em "Aceitar Proposta", o sistema registra: nome do signatário, documento/cargo, data e hora ISO, endereço IP e gera o **Hash Criptográfico SHA-256** do conteúdo integral do contrato, garantindo integridade e prova temporal.
   - Uma vez aceita, o sistema transforma a proposta automaticamente em um **Projeto em Andamento**.

---

## 9. Módulo 7: Gestão de Projetos e Kanbans de Entrega

1. Acesse **Projetos**.
2. Os projetos ativos são organizados por etapas de produção:
   - *Briefing e Coleta* -> *Design & Wireframe* -> *Desenvolvimento* -> *Homologação/Revisão* -> *Publicação*.
3. Cada projeto possui:
   - Barra de progresso percentual ponderada por fase.
   - Controle de prazo e sinalização visual de entregas atrasadas.
   - Checklist de pendências do cliente.

---

## 10. Módulo 8: Briefing Comercial e de Produção

Evite refações causadas por falta de alinhamento:
1. Acesse **Briefings**.
2. O sistema separa o briefing em 2 fases:
   - **Fase 1 (Comercial)**: Objetivo do site, público-alvo, principais concorrentes e referências que o cliente admira.
   - **Fase 2 (Produção Técnica)**: Paleta de cores, tipografia, seções obrigatórias, canais de contato e regras de negócio.
3. O formulário pode ser preenchido por você durante a reunião de alinhamento ou preenchido autonomamente pelo cliente através do portal.

---

## 11. Módulo 9: Portal do Cliente e Envio Seguro de Materiais

Cada cliente possui um portal web isolado em `/portal/:token`:
1. Acesse **Clientes** e copie o **Link do Portal**.
2. O cliente visualiza:
   - Status em tempo real do seu projeto e percentual de conclusão.
   - Proposta contratual para visualização e aceite digital.
   - Questionário de briefing.
   - **Checklist de Materiais com Upload Direto**:
     - Logomarca em vetor (.SVG, .AI, .PNG de alta resolução).
     - Fotos dos profissionais e do espaço físico.
     - Textos institucionais e informações cadastrais.
3. **Prevenção de IDOR**: A rota do portal valida o token com banco de dados isolado. O cliente jamais tem acesso a informações de outros clientes, custos da agência ou CRM.

---

## 12. Módulo 10: Compilador de Prompts Mestre para IA

Se você utiliza inteligência artificial (Claude, ChatGPT, Gemini, Antigravity) para programar os sites:
1. Vá até o menu **Gerador de Imagens e Prompts**.
2. Selecione o projeto e nicho.
3. O compilador gera dois pacotes prontos:
   - **Prompt Mestre de Engenharia de Software**: Especificações técnicas completas, hierarquia HTML5 semântica, Tailwind CSS, otimizações de Core Web Vitals, formulários validados e acessibilidade WCAG.
   - **Prompts de Direção de Arte e Imagens**: Prompts para Midjourney/Flux/DALL-E com parâmetros de iluminação, enquadramento e paleta de cores para o nicho em questão.
4. Basta clicar em **Copiar Prompt** e colar na sua IA de preferência.

---

## 13. Módulo 11: Automações e Fila do Agente Local Antigravity

1. Acesse **Automações**.
2. Acompanhe as regras ativas de automação orientadas a eventos (ECA):
   - *Quando proposta for aceita -> Criar projeto e notificar.*
   - *Quando projeto avançar de fase -> Atualizar progresso e notificar.*
3. **Agente em Segundo Plano**:
   - O worker `agent/src/index.ts` executa na máquina do operador.
   - Ele detecta automaticamente se os binários do Google Antigravity (`agy-node.cmd`, `antigravity-ide.cmd`) estão disponíveis.
   - Quando você desliga seu computador, o sistema continua estável: os jobs aguardam na fila SQLite (`pending`) e são retomados assim que o agente se reconecta, sem perda de dados.

---

## 14. Módulo 12: Gestão Financeira e Relatórios de Desempenho

1. Acesse **Financeiro**:
   - Métricas em tempo real: Total Faturado, Receita Recebida, Valores Pendentes e Previsão de Entradas.
   - Registro de pagamentos manuais (PIX, transferência, boleto) sem taxas de gateway.
   - Botão **Exportar CSV** para controle no Excel ou envio ao contador.
2. Acesse **Relatórios**:
   - Taxas de conversão do funil de vendas (Leads -> Reunião -> Proposta -> Fechamento).
   - Análise de ticket médio por nicho de atuação.
   - Velocidade média de entrega de projetos.

---

## 15. Rotinas de Backup, Segurança e Restauração

O SQLite armazena todos os dados no arquivo:
```
data/praxis.db
```
E os arquivos enviados pelos clientes ficam em:
```
uploads/
```

### Como Fazer Backup Diário (R$ 0):
Para criar uma cópia de segurança completa e segura de toda a sua agência, basta copiar a pasta `data/` e a pasta `uploads/` para um pen drive ou serviço de nuvem pessoal gratuito (Google Drive / OneDrive / Dropbox):
```powershell
# Exemplo em PowerShell para criar backup compactado
Compress-Archive -Path data, uploads -DestinationPath "backup_praxis_$(Get-Date -Format 'yyyy-MM-dd').zip"
```

### Como Restaurar:
Se precisar reinstalar o sistema ou trocar de computador:
1. Instale o Node.js.
2. Clone ou extraia os arquivos do PRAXIS.
3. Copie o arquivo `praxis.db` para a pasta `data/` e os arquivos para `uploads/`.
4. Execute `npm install` e `npm run dev`.
Todos os seus leads, propostas, contratos assinados, clientes e métricas estarão intactos com 100% de integridade transacional!
