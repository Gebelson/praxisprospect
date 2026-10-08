# PRAXIS

> **Plataforma Profissional de Captação, Vendas, Criação e Gestão de Projetos Web com Inteligência Artificial e Agente Local**

O **PRAXIS** é um software completo desenvolvido para permitir que uma única pessoa opere uma agência digital inteira de alta performance — desde a descoberta de potenciais clientes no comércio local até a entrega final do site, contratos digitais com hash SHA-256, briefing de produção, portal do cliente blindado e gestão financeira.

---

## ⚡ Princípio Fundamental: R$ 0 de Investimento Inicial

O PRAXIS foi concebido e programado sob a premissa de **custo zero de infraestrutura e zero APIs pagas obrigatórias**:
- **Banco de Dados Nativo**: SQLite 3.46+ ACID através do módulo nativo `node:sqlite` do Node.js v24 (sem necessidade de compilação em C++ ou ferramentas de build externas).
- **Prospecção Legal e Gratuita**: Motor OpenStreetMap Overpass API com tratamento de timeout e contingência de dados abertos verificados.
- **Engenharia Determinística**: Algoritmos matemáticos auditáveis para Lead Scoring (0 a 100), Precificação Dinâmica (margem, impostos, piso e parcelamento) e Validações.
- **Armazenamento de Arquivos Local**: Upload multipart com validação de extensões seguras, sanitização de nomes e limites de tamanho em disco local.
- **Agente Local Autônomo**: Conexão e integração transparente com o Google Antigravity CLI e workers em segundo plano. Quando o computador ou agente estiver offline, as tarefas permanecem preservadas na fila persistente SQLite com locking transacional.

---

## 🏛️ Arquitetura do Sistema

```
praxis/
├── agent/                         # Worker em segundo plano para tarefas pesadas locais
│   └── src/index.ts               # Heartbeat, polling da fila e execução assíncrona
├── data/                          # Persistência de dados locais
│   └── praxis.db                  # Banco de dados SQLite (WAL mode, Foreign Keys)
├── server/                        # Backend REST estruturado em Node.js / Express
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts        # Conexão nativa node:sqlite e transactions
│   │   │   └── schema.ts          # DDL de todas as 57 entidades e seeds padrão
│   │   ├── services/              # Regras de negócio e motores determinísticos
│   │   │   ├── osmService.ts      # Descoberta via Overpass API
│   │   │   ├── leadScoringService.ts # Cálculo auditável de score
│   │   │   ├── pricingEngine.ts   # Orçamentação com margem de segurança
│   │   │   ├── proposalService.ts # 19 cláusulas contratuais + hash SHA-256
│   │   │   ├── briefingService.ts # Briefings comercial e técnico
│   │   │   ├── materialsChecklistService.ts # Checklists automáticos de materiais
│   │   │   ├── siteGeneratorService.ts # Gerador de sites demo por nicho
│   │   │   ├── promptGeneratorService.ts # Prompts mestre para IA e arte
│   │   │   ├── automationEngine.ts # Motor ECA (Event-Condition-Action)
│   │   │   ├── agentQueueService.ts # Fila SQLite com retry e backoff
│   │   │   ├── antigravityService.ts # Detecção de binários Antigravity CLI
│   │   │   ├── messagingService.ts # Scripts de WhatsApp, Instagram e Email
│   │   │   └── financialService.ts # Fluxo de caixa, DRE e exportação CSV
│   │   └── routes/                # 17 rotas REST isoladas e portal do cliente
│   └── tsconfig.json
├── src/                           # Frontend React 18 + Vite + Tailwind CSS
│   ├── components/                # Layout, Sidebar com 15 módulos, Header, CommandPalette (Ctrl+K)
│   ├── pages/                     # Telas completas dos 15 módulos e Portal do Cliente
│   └── App.tsx
├── tests/                         # Suíte de testes automatizados com Vitest
│   └── praxis.test.ts             # 27 fluxos de testes obrigatórios (100% aprovados)
├── uploads/                       # Diretório seguro de arquivos enviados
└── package.json
```

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js**: v22.x ou v24.x (recomendado v24.13.1+)
- **NPM**: v10+

### 1. Instalar Dependências
```bash
npm install
```

### 2. Modo Desenvolvimento Integrado
Executa simultaneamente o servidor backend na porta `3001` e o Vite com hot-reload na porta `5173`:
```bash
npm run dev
```

Acesse:
- **Painel Administrativo**: [http://localhost:5173](http://localhost:5173) (ou `http://localhost:3001` no build)
- **API REST Backend**: [http://localhost:3001/api](http://localhost:3001/api)

### 3. Executar o Agente Local em Segundo Plano
Em outro terminal, inicie o worker do agente:
```bash
npm run dev:agent
```

### 4. Compilar para Produção
Gera o bundle otimizado do frontend e compila o servidor TypeScript:
```bash
npm run build
```

Para iniciar o servidor unificado em modo de produção:
```bash
npm start
```

---

## 🧪 Testes Automatizados

O PRAXIS conta com uma suíte de testes de integração e validação que cobre todos os **27 fluxos obrigatórios** da plataforma:

```bash
npm test
```

### Resumo dos 27 Testes Aprovados:
1. ✅ Conexão ACID e inicialização de esquema relacional no SQLite.
2. ✅ Descoberta de empresas por fonte autorizada (OpenStreetMap Overpass + contingência).
3. ✅ Deduplicação inteligente de leads por telefone e domínio.
4. ✅ Cálculo determinístico de Score Comercial com justificativa auditável.
5. ✅ Transição do funil Kanban e avanço de estágios no CRM.
6. ✅ Conversão de Lead em Cliente com isolamento de dados.
7. ✅ Cálculo de Orçamento com horas, margem, piso e opções de pagamento.
8. ✅ Geração de Proposta Comercial formal com 19 cláusulas contratuais.
9. ✅ Aceite digital de proposta com registro de IP, data e hash SHA-256.
10. ✅ Conversão automática de Proposta Aprovada em Projeto em Andamento.
11. ✅ Checklist dinâmico de materiais faltantes por nicho.
12. ✅ Briefing interativo em 2 etapas (Comercial e Produção).
13. ✅ Geração de Site Demonstrativo com aviso explícito de demonstração não oficial.
14. ✅ Geração de Prompts Mestre para Engenharia de Software e Direção de Arte.
15. ✅ Scripts de abordagem multicanal com links diretos (WhatsApp, Instagram, Email).
16. ✅ Fila de execução de tarefas do agente com locking transacional.
17. ✅ Registro de transações financeiras e atualização de métricas do Dashboard.
18. ✅ Validação de Regras do Motor de Automações (ECA).
19. ✅ Exportação financeira em formato CSV auditável.
20. ✅ Central de Notificações com persistência e leitura em lote.
21. ✅ Busca Global indexada em todas as entidades pelo Command Palette.
22. ✅ Isolamento estrito do Portal do Cliente (Prevenção de IDOR por token).
23. ✅ Upload seguro de arquivos com validação de extensão e tipo MIME.
24. ✅ Interrupção segura de tarefas caso limite/cota seja atingido.
25. ✅ Preservação da fila quando o agente local está desconectado.
26. ✅ Retomada automática de tarefas interrompidas após reinicialização.
27. ✅ Detecção do ambiente de desenvolvimento Antigravity CLI na máquina local.

---

## 🔒 Segurança e Privacidade

- **Isolamento de Acesso do Cliente**: O Portal do Cliente utiliza tokens hexadecimais de alta entropia. O cliente tem visão restrita exclusivamente ao seu projeto, materiais e aceite da sua proposta. Dados de CRM, concorrentes, custos internos e margens nunca são expostos na API do portal.
- **Aviso Obrigatório de Demonstração**: Todos os sites gerados contêm uma tarja de advertência destacando que o modelo é uma proposta demonstrativa de conceito criada pela agência, protegendo contra alegações de apropriação indevida de marca.
- **Integridade Contratual**: Aceites de propostas salvam data, hora ISO, IP e o hash criptográfico SHA-256 do texto aceito.

---

## 📄 Licença

Software desenvolvido sob licença proprietária para automação de agência de desenvolvimento de sites com inteligência artificial.
