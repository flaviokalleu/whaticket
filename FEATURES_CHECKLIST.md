# Checklist de features — paridade com Whaticket completo

Base: instalação atual é a versão community/base (Dashboard, Conexões, Tickets, Contatos, Respostas Rápidas, Usuários, Filas, Configurações). Este checklist lista o que falta para chegar perto de forks completos (WhaticketPlus, Whaticket SaaS), organizado por fases de complexidade crescente.

Cada item tem: o que é, por que essa ordem, e o que precisa ser criado (models/backend/frontend).

---

## Fase 1 — Baixa complexidade, alto impacto (fundação para o resto)

- [ ] **Tags/Etiquetas**
  - Model novo (`Tag`, tabela pivô `ContactTag` ou `TicketTag`), CRUD simples, seletor de tags no ticket/contato, filtro por tag na lista de tickets.
  - Base para Kanban e Campanhas (segmentação por tag).

- [ ] **Carteira de clientes (contato fixo por atendente)**
  - Campo `userId` já existe em `Contact`? Checar; se não, adicionar. UI simples de atribuição.

- [ ] **Tarefas**
  - Model `Task` (título, prazo, ticket/contato vinculado, responsável, status). CRUD + lista, opcionalmente vinculado ao ticket.

## Fase 2 — Automação de mensagens (isolada, não depende de IA)

- [ ] **Agendamento de mensagens**
  - Model `Schedule` (contato, corpo, mídia, data/hora, recorrência, status). Job/worker (Bull/cron) para disparar na hora. Página de agendamentos + CRUD.

- [ ] **Campanhas em massa**
  - Model `Campaign` + `CampaignContact`/lista de destinatários (por tag ou upload), fila de disparo com throttling (evitar ban do WhatsApp), relatório de envio/entrega/falha.
  - Depende de: Tags (Fase 1) para segmentação, infraestrutura de fila (Bull/Redis já existe no projeto).

## Fase 3 — Visualização e organização

- [ ] **Kanban**
  - Reaproveita `Ticket.status` ou introduz `KanbanColumn`/`KanbanBoard` customizável. Frontend com drag-and-drop (ex. `react-beautiful-dnd` ou `@dnd-kit`).
  - Depende de: Tags (para cards mais ricos), mas pode ser feito só com status também.

- [ ] **Dashboard com métricas reais / SLA**
  - Verificar o que `pages/Dashboard` já mostra hoje; adicionar tempo médio de primeira resposta, tempo médio de resolução, tickets por fila/atendente, gráficos (já tem `recharts` instalado).

## Fase 4 — Comunicação interna e grupos

- [ ] **Chat interno entre atendentes**
  - Model `InternalMessage`/`InternalChat`, canal Socket.io dedicado (reaproveita infra existente), página de chat interno.

- [ ] **Gestão de grupos do WhatsApp**
  - Backend Baileys já suporta grupos — checar `whaileys.ts` para métodos de grupo disponíveis (criar, listar, adicionar/remover participante). Criar serviço + UI.

## Fase 5 — Automação avançada (maior esforço, maior valor)

- [ ] **Construtor de fluxo de chatbot (flow builder)**
  - O item mais complexo: model de fluxo (nós, condições, ações), motor de execução no backend que reage a mensagens recebidas, editor visual no frontend (ex. `react-flow`).
  - Pode começar simples: chatbot baseado em palavras-chave/menu numérico (sem editor visual) antes do builder visual completo.

- [ ] **Pesquisa de satisfação pós-atendimento**
  - Trigger automático ao fechar ticket, model `SatisfactionSurvey`, relatório de notas.

## Fase 6 — Integrações externas

- [ ] **Webhooks genéricos** (outbound) — configurar URL por evento (ticket criado, mensagem recebida etc.)
- [ ] **API REST documentada para terceiros** — hoje existe `apiRoutes.ts`/`isAuthApi`, mas falta endpoints completos (criar/listar tag, agendamento, contato) e documentação (Swagger/Postman collection)
- [ ] **N8N / Typebot / DialogFlow / ChatGPT** — via webhook genérico (Fase 6.1) isso já viabiliza integração com N8N/Typebot sem código adicional específico; DialogFlow/ChatGPT como provider de chatbot plugado no flow builder (Fase 5)
- [ ] **Facebook/Instagram como canais adicionais** — grande escopo à parte (novo provider, como o Baileys é hoje para WhatsApp)

## Fase 7 — Infraestrutura/branding (opcional, baixa prioridade para uso interno)

- [ ] PWA (manifest + service worker)
- [ ] Logo/marca customizável, cores por instância
- [ ] Recuperação de senha por e-mail (hoje existe fluxo de reset?　checar)
- [ ] Domínio próprio por instância (só relevante se for multi-tenant/SaaS — hoje é single-tenant)

---

## Como vamos trabalhar

Sugiro seguir a ordem das fases (1 → 7), fechando um item por vez com plano + implementação + teste antes de ir para o próximo, já que várias fases dependem de fundações das anteriores (Tags → Kanban/Campanhas; fila de disparo → Campanhas/Agendamento).

**Próximo passo**: escolher por onde começar (Fase 1 é a recomendação — Tags é a base mais reaproveitada).
