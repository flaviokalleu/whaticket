# Evoticket → Whaticket: Inventário de Features e Plano de Migração

Evoticket é um sistema de helpdesk/CRM multi-tenant (multi-empresa) construído em Go (backend, Fiber/Gin-style REST API + GORM/Postgres + Redis + Asynq) com frontend React/Vite/TypeScript. Ele nasceu do mesmo tipo de produto que o whaticket (atendimento via WhatsApp com tickets), mas evoluiu para uma plataforma completa de "operação de empresa": além do helpdesk, inclui CRM/funil de vendas, Kanban/gestão de tarefas, motor de automação visual (flow builder tipo n8n), múltiplos agentes de IA com RAG e "autonomia", módulo financeiro completo (contas a pagar/receber, NFS-e, conciliação bancária, cobrança automática), integração com Meta Ads (Conversions API), central de chamadas VoIP (Asterisk), licenciamento, white-label, LGPD tooling, chip warm-up/anti-ban para números de WhatsApp, entre outros. Em escopo, Evoticket é ordens de grandeza maior que o whaticket-1: o whaticket-1 hoje cobre apenas o núcleo de atendimento via WhatsApp (tickets, contatos, usuários, filas, tags, respostas rápidas, dashboard básico). Este documento mapeia o que já existe (equivalente) e lista o gap completo, por área, com apontamento de arquivos/rotas de origem no Evoticket para facilitar a migração incremental.

> Fora de escopo deste plano, por decisão: **prospecção de leads via CNPJ/Receita Federal** e **entregas/logística (motoboy/roteirização)** — não serão portados. O licenciamento também foi reduzido a uma versão simples (validação de chave + limites), sem o aparato comercial completo de SaaS billing do Evoticket.

Este relatório cobre exclusivamente `backend/` (Go) e `frontend/` (React) do Evoticket, por escopo definido — não trata de `mobile/` (app Flutter) nem de `license-server/` (produto separado de licenciamento/fleet management), que ficam fora deste inventário.

---

## Já existe no whaticket (equivalente)

| Área Evoticket | Rotas/arquivos Evoticket | Equivalente no whaticket-1 |
|---|---|---|
| Auth (login/logout/JWT) | `POST /api/auth/login`, `/logout`, `/auth/me` | Sistema de login JWT + refresh token já existente |
| Tickets (CRUD, transferência, status) | `GET/POST/PATCH/DELETE /api/tickets*` | Módulo de Tickets (aberto/pendente/fechado, transferência entre usuários/filas/conexões) |
| Mensagens (enviar, mídia, reações) | `/api/messages/*` | Chat com mensagens de mídia, respostas citadas, Socket.io |
| Conexões WhatsApp (QR, pareamento) | `/api/connections/*` (subset Baileys-like) | Conexões WhatsApp via Baileys/whaileys |
| Contatos (CRUD, bloqueio, sync) | `/api/contacts/*` (subset) | Módulo de Contatos (CRUD, import) |
| Usuários (admin/agente, permissões básicas) | `/api/users/*` | Usuários (admin/user, fila padrão, conexão padrão) |
| Filas (Queues) | `/api/queues/*` | Filas (nome/cor/saudação) |
| Tags | `/api/tags/*` | Tags (nome/cor) para tickets/contatos |
| Respostas Rápidas | `/api/quick-replies/*` | Quick Answers (atalho → mensagem) |
| Dashboard básico | `/api/dashboard/stats` | Dashboard com gráficos de tickets |
| Configurações simples | `/api/settings/company`, `/api/settings/system` | Settings (toggle de criação de usuário, API token) — Evoticket tem versão muito mais rica |
| WebSocket em tempo real | `GET /api/ws` (Gorilla WS) | Socket.io já usado no whaticket |
| Tokens de API | `/api/api-tokens/*` | API token já existe (mínimo) no Settings |

Conclusão: o núcleo "helpdesk de WhatsApp" (tickets, contatos, usuários, filas, tags, respostas rápidas, dashboard simples, auth) já está coberto em versão simplificada. Tudo abaixo é gap real.

---

## Precisa implementar no whaticket

Agrupado por área. Complexidade é uma estimativa grosseira considerando volume de rotas/models + telas de frontend envolvidas.

### 1. Multi-tenant / Empresas (Companies)
O whaticket-1 não tem conceito de "empresa" (tenant) — é uma instalação única. Evoticket é multi-tenant: toda entidade tem `company_id`, com isolamento de dados, planos por empresa, limites de uso, feature flags por módulo.
- Rotas: `/api/companies/*`, `/api/admin/companies/*`, middleware `CheckCompanyBlocked`/`CheckMaintenanceMode`, `RequireModule`/`RequireModuleAndPermission` (feature-flag por módulo/empresa)
- Models: `Company`, `CompanySettings`, `CustomPlanConfig`
- **Efforte: grande** (arquitetural — decisão de negócio se o whaticket-1 deve virar multi-tenant ou continuar single-org; afeta praticamente todas as tabelas)

### 2. Licenciamento simples (sem SaaS completo)
Reduzido do escopo original do Evoticket (que tinha billing recorrente completo, checkout via Mercado Pago/Asaas, programa de afiliados com comissão/payout e dunning). Para o whaticket-1, faz mais sentido um licenciamento enxuto: validar uma licença/chave e aplicar limites de uso, sem o aparato comercial (cupons, afiliados, faturas).
- Rotas de referência (subset a considerar): `/api/license/status`, `/api/license/activate`, `/api/license/validate`, `/api/license/info`
- Models de referência (subset): `License` (chave, status, expiração, limites básicos)
- Middleware de referência: `LicenseMiddleware` (validação simples), `CheckLicenseLimits`
- **Fora do escopo (não portar)**: `Subscription`, `Payment`, `Invoice`, `Coupon`, `Affiliate*`, integrações Mercado Pago/Asaas, portal de afiliados, dunning — todo o aparato de venda/cobrança recorrente do Evoticket
- **Esforço: pequeno/médio** (validação de chave + limites), bem menor que o "Licenciamento / SaaS Billing" original

### 3. CRM / Leads / Funil de Vendas / Propostas
Pipeline de vendas completo, separado do helpdesk de tickets.
- Rotas: `/api/crm/pipelines*`, `/api/crm/deals*`, `/api/crm/leads*`, `/api/crm/lead-pipelines`, `/api/proposals*`, `/api/proposal-templates*`, `/api/contracts*`
- Models: `Pipeline`, `PipelineStage`, `Deal`, `DealNote`, `Lead`, `LeadInteraction`, `LeadTask`, `LeadPipeline`, `Proposal`, `ProposalTemplate`, `Contract`
- Frontend: `CRM.tsx` (pipeline/kanban de leads), `CRMIntegrations.tsx` (HubSpot/Salesforce), `Proposals.tsx`, `FollowUp.tsx`
- **Esforço: grande**

### 4. Kanban / Boards / Tarefas
Sistema tipo Trello, genérico (não ligado a tickets), + kanban pessoal.
- Rotas: `/api/boards/*` (lanes, tasks, notes, timeline, tags, checklist, anexos, views, geração via IA), `/api/ticket-lanes/*` (kanban de tickets), `/api/personal-kanban/*`, `/api/task-queues/*`, `/api/tasks/*`
- Models: `Board`, `BoardShare`, `BoardLane`, `BoardTask` (+tags/checklist/anexos/eventos), `BoardView`, `BoardAIGeneration`, `PersonalKanbanLane/Item`, `Task`, `TaskComment`, `TaskQueue`, `TicketLane`
- Frontend: `Boards/` (BoardsHome, BoardWorkspace, várias views), `MeuKanban.tsx`
- **Esforço: grande**

### 5. Flow Builder / Automação Visual (tipo n8n)
Motor de execução de fluxos de automação (nós: condição, delay, webhook, IA, envio de mensagem, RAG query, HTTP request etc.), com importação de fluxos do n8n e geração de fluxo via IA.
- Rotas: `/api/flows/*` (CRUD, execução, analytics, resultados, import n8n, geração IA, webhook trigger)
- Backend: `internal/engine` (motor de execução com `NodeExecutor` por `NodeType`), `internal/queue` (fila Asynq para execução assíncrona)
- Models: `Flow`, `FlowExecution`
- Frontend: `Flows/` (`FlowBuilder.tsx` usando `@xyflow/react`, paleta de nós, painel de propriedades, analytics)
- **Esforço: grande**

### 6. IA / Agentes de IA (multi-provider, RAG, autonomia)
Framework completo de agentes de IA multi-provider (Claude, OpenAI, Gemini, Groq, DeepSeek, Cloudflare AI, Ollama) com RAG (embeddings pgvector), memória de longo prazo por contato, "aprendizado" a partir de tickets históricos, autonomia com aprovação humana, guardrails de privacidade/segurança, e uma base de conhecimento de UI do próprio sistema.
- Rotas: `/api/ai-agents/*` (CRUD, chat, templates, conhecimento, aprendizado/"brain", context enrichment, audit logs), `/api/agent-approvals/*` (fila de aprovação para ações sensíveis), `/api/knowledge-bases/*` (RAG: documentos, embeddings, busca vetorial), `/api/ai/*` (tradução, OCR de imagem, transcrição de áudio via Groq Whisper, chat genérico, sugestão de resposta), `/api/privacy/*` (guarda de privacidade — bloqueia agente que tenta vazar dado sensível)
- Backend: `internal/ai` (dispatcher, providers, memory, rag, safety/risk_classifier, system_kb, tools, autonomybridge), muitos `services/agent_*.go`, `approach_*.go`
- Models: `AIAgent`, `AIConversation`, `AIMessage`, `KnowledgeBase`, `Document`, `DocumentChunk`, `DocumentEmbedding` (pgvector), `AgentMemory`, `AgentKnowledgeCategory/Item`, `AgentConversationStage/StageTransition`, `AgentMetrics`, `AgentExecutionLog`, `AgentBehaviorConfig`, `ContactMemory`, `ContactInteractionSummary`, `AgentApproach`, `AgentConversationOutcome`, `AgentAuditLog`, `AgentSnapshot`, `AgentBlock`, `AgentPrivacyViolation`, `Prompt`, `TicketAgentBond`
- Frontend: `AIAgents/`, `AgentEdit/` (abas: Geral, Prompt, Comportamento, Conhecimento, Acesso, Autonomia, Ferramentas, Mídia, Resultados, Brain), `AgentBrainPage.tsx` (visualização 3D do "cérebro"/aprendizado), `AIAgent.tsx` (testador standalone), `KnowledgeBase.tsx`
- **Esforço: muito grande** — o maior subsistema do produto. Recomenda-se migrar em fatias (ex.: começar por "sugestão de resposta" simples com um único provider antes de tentar autonomia completa)

### 7. Módulo Financeiro (contas a pagar/receber, NFS-e, cobrança)
Sistema financeiro completo: contas a receber/pagar, cobrança automatizada (WhatsApp), emissão de nota fiscal de serviço eletrônica (NFS-e — Brasil), conciliação bancária, relatórios (DRE, aging, fluxo de caixa), IA para previsão de pagamento/timing ótimo de cobrança, integração PIX (Asaas).
- Rotas: `/api/finance/*` (~60 rotas), `/api/financial/*` (resumo simplificado)
- Backend: `services/finance*.go`, `services/nfse.go`, `services/asaas.go`, `services/mercadopago.go`, `services/billing_dunning.go`
- Models: `FinanceCustomer`, `FinanceCategory`, `FinanceReceivable(+Payment)`, `FinancePayable(+Attachment)`, `FinanceObservation`, `FinanceSettings`, `FinanceMessageTemplate`, `FinanceChargeLog`, `FinanceNFSe`, `DunningEscalationStep`, `FinanceAccount`, `FinanceCostCenter`, `FinanceTransaction`, `FinanceAuditLogEntry`
- Frontend: `Finance.tsx`, `FinanceCashflow.tsx`, `Financial.tsx`
- **Esforço: muito grande** — módulo verticalizado para Brasil (NFS-e, CPF/CNPJ, PIX); só relevante se whaticket-1 quiser competir nesse segmento

### 8. Campanhas / Disparo em Massa / Grupos / Anti-ban
Envio de campanhas em massa (texto/mídia/botões/lista/carrossel), broadcast para grupos de WhatsApp, auto-entrada em grupos, e um sistema completo de "anti-ban" (chip warm-up, comportamento humano simulado, monitor de reputação).
- Rotas: `/api/campaigns/*`, `/api/group-broadcasts/*`, `/api/groups/auto-join/*`, `/api/chip-warmup/*`, `/api/connections/anti-ban/*`
- Backend: `services/chip_warmup.go`, `anti_ban.go`, `human_behavior_engine.go`, `reputation_monitor.go`, `trust_monitor.go`, `content_variator.go`, `rate_limiter.go`, `adaptive_rate_controller.go`
- Models: `Campaign`, `CampaignContact`, `CampaignLog`, `GroupBroadcast(+Target/Template)`, `GroupAutoJoinConfig`, `GroupJoinQueue`, `CampaignGroupEngagement/Target`, `ChipWarmupSession/Connection`
- Frontend: `Campaigns.tsx`, `CampaignGroups.tsx`, `GroupBroadcast.tsx`, `GroupAutoJoin.tsx`, `GroupExport.tsx`, `ChipWarmup.tsx`
- **Esforço: grande** (o anti-ban sozinho é um subsistema sofisticado)

### 9. Sequências de Follow-up automatizado
Envio automático de mensagens em múltiplas etapas para reengajar contatos/leads.
- Rotas: `/api/followup-sequences/*`
- Models: `FollowUpSequence`, `FollowUpStep`, `FollowUpExecution`, `FollowUpOptOut`
- Frontend: `FollowUp.tsx`
- **Esforço: médio**

### 10. Central de Chamadas (VoIP / Asterisk)
Ligações de voz via Asterisk/Meowcaller, com gravação, transferência, fila, música de espera.
- Rotas: `/api/calls/*`
- Backend: `services/call_service.go`, `call_recorder.go`, `asterisk_service.go`, `meowcaller_service.go`, `audio_transcription.go`, `voice_tts.go`
- Models: `CallLog`, `HoldMusic`
- Frontend: `CallHistory.tsx`
- **Esforço: grande** (integração com infraestrutura de telefonia externa)

### 11. Canais adicionais (Telegram, Email, SMS, Chat Widget, Meta/Instagram/Messenger, WABA oficial)
Evoticket atende múltiplos canais além do WhatsApp não-oficial (Baileys): WhatsApp Cloud API oficial (WABA) com Embedded Signup, Telegram, Email (IMAP/SMTP), SMS (Textbee/NotificaMe), widget de chat embutido em site, Messenger/Instagram via Meta.
- Rotas: `/api/connections/sms*`, `/api/connections/notificame*`, `/api/connections/cloud-api*`, `/api/telegram-channels*`, `/api/email-channels/*`, `/api/chat-widgets/*`, `/api/meta-channels/*`, `/api/embedded-signup/*`, `/api/waba-templates/*`
- Models: `WABAConfig`, `EmailConnectionConfig`, `TelegramConnectionConfig`, `ChatWidgetConfig`, `SMSConnectionConfig`, `WABATemplate`
- Frontend: `ChatWidgets.tsx`, parte de `Connections.tsx`, `GatewaySignup.tsx`, `GoogleCallback.tsx`
- **Esforço: grande** (cada canal é uma integração própria; recomenda-se priorizar WABA oficial e Chat Widget primeiro)

### 12. Meta Conversions API (CAPI) / Ads
Envia eventos de conversão para o Facebook/Meta Ads a partir de tags/status de tickets — usado para otimizar campanhas de anúncio.
- Rotas: `/api/meta-capi/*`
- Backend: `services/meta_capi*.go` (7 arquivos), `meta_conversions.go`
- Models: `MetaCAPIMapping`, `MetaEvent`
- Frontend: Settings → `MetaCapi` tab
- **Esforço: médio** — só relevante se o público-alvo faz tráfego pago no Meta

### 13. Financeiro/Backoffice do SaaS: Backups, Auditoria, Bug Reports, Changelog, Anúncios
- Rotas: `/api/backups/*`, `/api/audit-logs`, `/api/admin/audit-logs`, `/api/bug-reports/*`, `/api/admin/bug-reports/*`, `/api/admin/changelog/*`, `/api/changelog`, `/api/announcements/*`, `/api/admin/notifications/*`, `/api/notifications/*`
- Models: `Backup`, `AuditLog`, `BugReport(+Attachment)`, `ChangelogEntry`, `Announcement`, `PlatformNotification(+Read)`, `AdminAlert`
- CLI: `backend/cmd/export-company` (export/backup de uma empresa)
- Frontend: `Backups.tsx`, `BugReports.tsx`, `ChangelogAdmin.tsx`/`Melhorias.tsx`, `Notifications.tsx`/`NotificationsAdmin.tsx`
- **Esforço: médio** — features de operação/suporte do produto, úteis independente do resto

### 14. White-label / Branding customizável
Permite trocar nome, logo, cores, background por tenant/instalação.
- Rotas: `PUT /api/settings/white-label`, `/logo`, `/background`
- Frontend: Settings → `WhiteLabel` tab
- **Esforço: pequeno/médio**

### 15. LGPD / Privacidade de dados
Exportação de dados de um contato (direito de acesso) e anonimização (direito ao esquecimento), conforme LGPD (equivalente brasileiro da GDPR).
- Rotas: `GET /api/contacts/:id/lgpd/export`, `DELETE /api/contacts/:id/lgpd/anonymize`
- **Esforço: pequeno**

### 16. Deduplicação de contatos / mapeamento LID
Encontra e mescla contatos duplicados; lida com o novo esquema de identificadores "LID" do WhatsApp multi-dispositivo.
- Rotas: `/api/contacts/dedup/*`
- Models: `WhatsAppLIDMap`
- **Esforço: pequeno/médio** — recomendável mesmo para o whaticket-1 atual, resolve um problema real do Baileys multi-device

### 17. Memória de contato para IA / Wallet de contato
Memória persistente por contato (usada por agentes de IA) e "carteira"/saldo por contato (crédito/pontos).
- Rotas: `/api/contacts/:id/memory*`, `/api/contacts/:id/wallet*`
- Models: `ContactMemory`, `ContactInteractionSummary`, `ContactWallet`, `ContactWalletTransaction`
- **Esforço: médio** (depende do módulo de IA para ter valor)

### 18. SLA / Reabertura de Ticket / Avaliação (CSAT) / NPS
Métricas de atendimento: SLA por fila com alerta de risco/violação, motivos de reabertura de ticket, avaliação do atendimento (CSAT) e pesquisa NPS completa.
- Rotas: `/api/sla/*`, `/api/reopen-reasons/*`, `/api/tickets/:id/rating`, `/api/nps/*`
- Models: `UserRating`, `TicketReopenReason`, `TicketReopenLog`, `NPSResponse`, `NPSPendingResponse`, `NPSStats`
- Frontend: `NPSDashboard.tsx`, parte de `Reports/`
- **Esforço: médio** — bom candidato de próxima fase por ser incremento direto sobre o módulo de Tickets já existente

### 19. Distribuição automática de tickets / Times / Departamentos
Regras de distribuição automática de tickets entre atendentes, além de um nível organizacional "Team" e "Department" acima das Filas.
- Rotas: `/api/attendants/*`, `/api/teams/*`, `/api/departments/*`
- Models: `Team`, `TeamUser`, `Department`
- Backend: `services/distribution.go`
- **Esforço: pequeno/médio**

### 20. Chat Interno (equipe)
Chat estilo Slack entre atendentes/usuários do sistema, separado do atendimento a clientes.
- Rotas: `/api/internal-chat/*`
- Models: `InternalChatGroup(+Member)`, `InternalChatMessage`, `InternalChatConversation`
- Frontend: `InternalChatPage.tsx`
- **Esforço: médio**

### 21. Notificações Push (Web Push / VAPID)
- Rotas: `/api/push/*`
- Models: `PushSubscription`, `PushNotificationPayload`, `NotificationAction`, `UserNotificationSettings`
- **Esforço: pequeno**

### 22. Calendário / Integração Google Calendar / Google Sheets
Agenda compartilhada com eventos, integração OAuth com Google Calendar e Google Sheets (para automações/flows).
- Rotas: `/api/calendar/*`, `/api/google-sheets/*`
- Models: `CalendarIntegration`, `CalendarEvent(+Seen/Attendee)`
- Frontend: `Calendar.tsx`
- **Esforço: médio**

### 23. Aniversários automáticos
Envio automático de mensagem de parabéns a contatos.
- Rotas: `/api/birthdays/*`
- Models: `BirthdaySetting`, `BirthdayLog`, `BirthdayInfo`
- **Esforço: pequeno**

### 24. 2FA (autenticação de dois fatores)
- Rotas: `/api/auth/2fa/*` (TOTP)
- **Esforço: pequeno** — bom item de segurança para adicionar cedo

### 25. Biblioteca de Mídia / Mensagens Agendadas / Templates de Mensagem
- Rotas: `/api/media-library/*`, `/api/scheduled-messages/*`, `/api/templates/*`, `/api/waba-templates/*`
- Models: `MediaLibraryItem`, `ScheduledMessage`, `MessageTemplate`, `WABATemplate`
- Frontend: `MediaLibrary.tsx`, `ScheduledMessages.tsx`, `WABATemplates.tsx`
- **Esforço: pequeno/médio cada** — incrementos diretos e de baixo risco sobre o módulo de mensagens já existente

### 26. Webhooks (entrada/saída) configuráveis por empresa
- Rotas: `/api/webhooks/*` (outbound), `/api/webhooks/flow/:token` (trigger de flow), `/api/admin/webhook-routes/*` (roteamento multi-sistema)
- Models: `Webhook`, `WebhookLog`, `WebhookRoute`
- Backend: `internal/security/ssrf.go` (proteção SSRF para URLs de webhook — importante copiar se implementar webhooks)
- **Esforço: médio**

### 27. Fila assíncrona / Jobs em background
Evoticket usa Asynq (Redis-based) para processar tarefas assíncronas (execução de flow, embeddings RAG, campanhas, cobrança financeira, importação CNPJ, eventos Meta CAPI, extração de memória) via um processo `worker` separado do processo `api`.
- Backend: `internal/queue` (`Task`, `TaskType`, `asynq.go`), `backend/cmd/worker`
- **Esforço: médio** — arquiteturalmente relevante mesmo sem portar as features específicas: qualquer feature assíncrona nova (campanhas, IA, etc.) se beneficia de ter um worker dedicado desde já

### 28. Kafka (observação)
Apesar do briefing inicial mencionar Kafka como possível gap, **não há nenhum uso de Kafka no código atual** — nem rotas, nem handlers, nem arquivos `kafka*.go` referenciados em `routes.go`. O diretório `internal/kafka` existe mas não está integrado ativamente ao fluxo principal (ver Notas). **Não é necessário portar nada de Kafka.**

---

## Rotas completas do backend (Evoticket)

> Fonte única: `backend/internal/routes/routes.go` (~2150 linhas, todas as rotas centralizadas nesse arquivo; handlers em `backend/internal/handlers/*.go`, um arquivo por feature).

### Infra / Raiz
| Method | Path | Handler | Área |
|---|---|---|---|
| GET | /api/caller-page | ServeCallerPage | Calls |
| GET | /api/health | inline | Infra |
| GET | /api/health/detailed | HealthCheckDetailed | Infra |
| POST | /api/worker-internal/trigger-campaign | inline | Campanhas (worker) |
| GET | /test | inline | Meta webhook debug |
| GET | /uploads/*, /media/* | static | Mídia |
| GET | /api/profile-pics/:filename | ServeProfilePicture | Mídia |
| GET/POST | /webhooks/meta, /webhook/meta | VerifyMetaWebhookSimple/HandleMetaWebhook | Meta |
| GET | /api/ws | inline (Gorilla WS) | Realtime |

### Licença
| Method | Path | Handler |
|---|---|---|
| GET | /api/license/status | GetLicenseStatus |
| GET | /api/license/setup-config | GetSetupConfig |
| GET | /api/license/check-domain | CheckDomain |
| POST | /api/license/activate | ActivateLicense |
| POST | /api/license/validate | ValidateLicense |
| GET | /api/license/info | GetLicenseInfo |
| POST | /api/license/deactivate | DeactivateLicense |
| POST | /api/license/revoke-webhook | RevokeLicenseWebhook |
| GET | /api/debug/features[/:companyId] | DebugCompanyFeatures |

### Auth / 2FA
| Method | Path | Handler |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | RefreshSession |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/google/config\|start\|callback | GoogleLogin* |
| POST | /api/auth/register | Register |
| POST | /api/auth/forgot-password | ForgotPassword |
| POST | /api/auth/reset-password | ResetPassword |
| POST | /api/auth/change-password | ChangePassword |
| POST | /api/auth/2fa/validate | Validate2FALogin |
| GET | /api/auth/2fa/setup | Setup2FA |
| POST | /api/auth/2fa/enable | Enable2FA |
| DELETE | /api/auth/2fa/disable | Disable2FA |
| GET | /api/auth/me | Me |

### Público / Widget / Portal de Afiliados
| Method | Path | Handler |
|---|---|---|
| GET | /api/public/plans | GetPublicPlans |
| GET | /api/public/landing-page-status | GetLandingPageStatus |
| GET | /api/public/branding | GetPublicBranding |
| POST | /api/public/landing-pixel | LandingPixelEvent |
| POST | /api/public/affiliate/track/:code | TrackAffiliateClick |
| GET | /api/public/affiliate/verify/:code | GetAffiliateByCode |
| POST | /api/public/affiliate/register | AffiliatePortalRegister |
| POST | /api/public/affiliate/login | AffiliatePortalLogin |
| GET | /api/public/affiliate/portal/dashboard | AffiliatePortalDashboard |
| GET | /api/public/affiliate/portal/commissions | AffiliatePortalCommissions |
| GET | /api/public/affiliate/portal/payouts | AffiliatePortalPayouts |
| PUT | /api/public/affiliate/portal/pix | AffiliatePortalUpdatePix |
| GET | /api/widget/:apiKey/init | WidgetInit |
| POST/GET | /api/widget/:apiKey/messages | WidgetSendMessage/WidgetGetMessages |

### Worker-Internal
| Method | Path | Handler |
|---|---|---|
| POST | /api/worker-internal/send-message | InternalSendMessage |
| POST | /api/worker-internal/campaign-watchdog | InternalCampaignWatchdog |

### Companies (Super Admin) / Plans
| Method | Path | Handler |
|---|---|---|
| GET/POST | /api/companies[/:id] | GetCompanies/GetCompany/CreateCompany |
| PUT/DELETE | /api/companies/:id | UpdateCompany/DeleteCompany |
| POST | /api/companies/:id/reset-conversations | ResetCompanyConversations |
| GET/POST | /api/companies/:id/users | GetCompanyUsers/CreateCompanyUser |
| GET | /api/plans[/:id] | ListPlans/GetPlan |
| POST/PUT/DELETE | /api/plans[/:id] | CreatePlan/UpdatePlan/DeletePlan |
| GET | /api/plans/:id/stats | GetPlanStats |

### Perfil de Usuário / Afiliado / Bug Reports
| Method | Path | Handler |
|---|---|---|
| GET/PUT | /api/user/profile | GetUserProfile/UpdateUserProfile |
| PUT | /api/user/menu-preference | UpdateLayoutPreference |
| POST | /api/user/avatar | UploadUserAvatar |
| GET | /api/my-affiliate | GetMyAffiliate |
| PUT | /api/my-affiliate/pix | UpdateMyAffiliatePix |
| POST | /api/bug-reports | CreateBugReport |
| POST | /api/bug-reports/upload | UploadBugAttachment |
| GET | /api/bug-reports/mine | GetMyBugReports |

### Tickets
| Method | Path | Handler |
|---|---|---|
| GET | /api/tickets | GetTickets |
| GET | /api/tickets/groups | GetGroupTickets |
| GET | /api/tickets/contacts | GetContactTickets |
| POST | /api/tickets | CreateTicket |
| POST | /api/tickets/close-all | CloseAllTickets |
| DELETE | /api/tickets/delete-all | DeleteAllTickets |
| POST | /api/tickets/bulk-action | BulkTicketAction |
| POST | /api/tickets/:id/classify | ClassifyTicketManual |
| GET/POST/DELETE | /api/tickets/pinned, /:id/pin | GetPinnedTickets/PinTicket/UnpinTicket |
| GET/POST | /api/tickets/muted, /mute-bulk, /unmute-bulk | GetMutedTickets/MuteTicketsBulk/UnmuteTicketsBulk |
| POST/DELETE | /api/tickets/:id/mute | MuteTicket/UnmuteTicket |
| GET/POST/DELETE | /api/tickets/:id/participants[/:userId] | GetTicketParticipants/InviteParticipant/RemoveParticipant |
| GET | /api/tickets/:id/blocked | CheckAgentBlockForTicket |
| GET | /api/tickets/:id/waba-window | GetTicketWABAWindow |
| GET/PATCH/DELETE | /api/tickets/:id | GetTicket/UpdateTicket/DeleteTicket |
| PATCH | /api/tickets/:id/read | MarkTicketAsRead |
| POST | /api/tickets/:id/transfer | TransferTicket |
| POST/DELETE | /api/tickets/:id/tags/:tagId | AddTicketTag/RemoveTicketTag |
| GET | /api/tickets/:ticketId/export, /export/all | ExportTicket/ExportAllTickets |
| GET | /api/tickets/:id/media/download | DownloadTicketMediaArchive |
| GET | /api/tickets/:ticketId/reopen-logs | GetTicketReopenLogs |
| POST | /api/tickets/:id/close-with-reason | CloseTicketWithReason |
| GET | /api/tickets/:ticketId/nps | GetNPSByTicket |
| GET/POST/PUT/DELETE | /api/tickets/:ticketId/notes[/:id] | List/Create/Update/DeleteTicketNote |
| GET/POST | /api/tickets/:ticketId/rating | GetTicketRating/CreateUserRating |

### Categorias de Ticket / Bloqueios de Agente / SLA
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/ticket-categories[/:id] | List/Create/Update/DeleteTicketCategory |
| GET/POST/DELETE | /api/agent-blocks[/:blockId] | GetAgentBlocks/BlockAgent/UnblockAgent |
| GET | /api/sla/stats, /at-risk, /breached, /ticket/:id | GetSLAStats/GetTicketsAtRisk/GetBreachedTickets/GetTicketSLAInfo |
| GET/PUT | /api/queues/:id/sla | GetQueueSLA/UpdateQueueSLA |

### Kanban de Tickets / Kanban Pessoal / Filas de Tarefa / Tarefas
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/ticket-lanes[/:id] | List/Get/Create/Update/DeleteTicketLane |
| POST | /api/ticket-lanes/reorder | ReorderTicketLanes |
| PATCH | /api/ticket-lanes/ticket/:ticketId/lane | MoveTicketToLane |
| GET/POST/PUT/DELETE | /api/personal-kanban/lanes[/:id] | List/Create/Update/DeletePersonalKanbanLane |
| POST | /api/personal-kanban/lanes/reorder, /:id/assign-user, /:id/unassign-user | ReorderPersonalKanbanLanes/Assign/UnassignKanbanLaneToUser |
| GET/POST/PUT/DELETE | /api/personal-kanban/items[/:id] | List/Add/Move/RemovePersonalKanbanItem |
| POST | /api/personal-kanban/items/reorder | ReorderPersonalKanbanItems |
| GET/POST/PUT/DELETE | /api/task-queues[/:id] | List/Get/Create/Update/DeleteTaskQueue |
| GET/POST/PUT/DELETE | /api/tasks[/:id] | ListTasks/GetTask/CreateTask/UpdateTask/DeleteTask |
| GET | /api/tasks/stats | GetTaskStats |
| PUT | /api/tasks/:id/move | MoveTask |
| POST | /api/tasks/:id/complete, /reorder | CompleteTask/ReorderTasks |
| GET/POST/DELETE | /api/tasks/:taskId/comments[/:commentId] | Get/Create/DeleteTaskComment |

### Boards (Kanban/Boards)
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/boards[/:id] | List/Get/Create/Update/DeleteBoard |
| GET | /api/boards/share-options, /:id/share-options | GetCompanyShareOptions/GetBoardShareOptions |
| POST/DELETE | /api/boards/:id/shares[/:shareId] | ShareBoard/UnshareBoard |
| POST/PUT/DELETE | /api/boards/:id/lanes[/:laneId] | Create/Update/DeleteBoardLane |
| POST | /api/boards/:id/lanes/reorder | ReorderBoardLanes |
| POST/GET/PUT/DELETE | /api/boards/:id/tasks[/:taskId] | Create/GetDetail/Update/DeleteBoardTask |
| PUT | /api/boards/:id/tasks/:taskId/move | MoveBoardTask |
| GET/POST | /api/boards/:id/notes, /:id/tasks/:taskId/notes | GetBoardNotes/CreateBoardNote/GetTaskNotes/CreateTaskNote |
| GET | /api/boards/:id/timeline | GetBoardTimeline |
| GET/POST/DELETE | /api/boards/tasks/:taskId/tags[/:tagId] | TaskExtras List/Add/RemoveTag |
| GET/POST | /api/boards/tasks/:taskId/checklist, /checklist/reorder | TaskExtrasList/CreateChecklistItem/Reorder |
| PUT/DELETE | /api/boards/checklist/:itemId | TaskExtrasUpdate/DeleteChecklistItem |
| GET/POST/DELETE | /api/boards/tasks/:taskId/attachments, /attachments/:id | TaskExtrasList/Upload/DeleteAttachment |
| GET | /api/boards/tasks/:taskId/events | TaskExtrasListEvents |
| POST/DELETE | /api/boards/ai/preview, /ai/generations/:id[/apply] | Preview/Apply/DiscardBoardGeneration |
| GET/POST/PUT/DELETE | /api/boards/:id/views, /views/:viewId | Get/Create/Update/DeleteBoardView |

### Notificações de Grupo / Aniversários
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/groups/with-notifications, /:id/notifications[/:userId] | List/Add/Toggle/RemoveGroupNotificationSetting |
| GET/PUT | /api/birthdays/settings | GetBirthdaySettings/UpdateBirthdaySettings |
| GET | /api/birthdays/upcoming, /today, /logs | GetUpcomingBirthdays/GetTodayBirthdays/GetBirthdayLogs |
| POST | /api/birthdays/send-message | SendBirthdayMessage |

### Mensagens
| Method | Path | Handler |
|---|---|---|
| GET | /api/messages/ticket/:ticketId[/media] | GetMessages/GetTicketMedia |
| GET | /api/messages/link-preview | GetLinkPreview |
| POST | /api/messages/send, /send-media, /send-buttons, /send-list, /send-carousel | SendMessage/SendMediaMessage/SendButtonsMessage/SendListMessage/SendCarouselMessage |
| DELETE/PUT/PATCH | /api/messages/:messageId[/edit] | DeleteMessage/EditMessage |
| POST | /api/messages/:messageId/react, /pin, /favorite, /forward | ReactToMessage/PinMessage/FavoriteMessage/ForwardMessage |

### Conexões WhatsApp / SMS / NotificaMe / Cloud API / Sync
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/connections[/:id] | GetConnections/CreateConnection/UpdateConnection/DeleteConnection |
| GET | /api/connections/diagnose | DiagnoseConnections |
| POST | /api/connections/:id/connect, /disconnect, /refresh-token | Connect/Disconnect/RefreshTokenWhatsApp |
| GET | /api/connections/:id/caller-url | GetCallerURL |
| GET/POST/PUT/DELETE | /api/connections/sms[/:id] | ListSMSConnections/CreateSMSConnection/UpdateSMSConnection/DeleteSMSConnection |
| POST | /api/connections/sms/textbee, /sms/notificame | CreateTextbeeSMSConnection/CreateNotificameSMSConnection |
| POST/PUT | /api/connections/notificame[/:id] | CreateNotificaMeConnection/UpdateNotificaMeConnection |
| GET | /api/connections/notificame/:id/templates | ListNotificaMeTemplates |
| GET/POST/PUT | /api/connections/cloud-api/instructions, /cloud-api[/:id] | GetCloudAPIInstructions/SetupCloudAPIConnection/UpdateCloudAPIConnection |
| POST | /api/connections/:id/cloud-api/test, /connect-meta | TestCloudAPIConnection/ConnectMetaPage |
| GET/PUT | /api/connections/:id/anti-ban/stats, /anti-ban/config | GetAntiBanStats/GetAntiBanConfig/UpdateAntiBanConfig |
| POST | /api/connections/:id/pair-phone, /import-session, /new-qr, /refresh-contacts | PairPhone/ImportSession/RequestNewQRCode/RefreshContacts |
| GET/POST | /api/connections/:connectionId/sync[/:syncId][/preview\|/active\|/force-download\|/message-count\|/chats\|/cancel] | GetConnectionSyncs/StartMessageSync/... |

### CRM Integrations / Telegram / Email / Chat Widgets
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/crm-integrations[/:id] | List/Get/Create/Update/DeleteCRMIntegration |
| POST/GET | /api/crm-integrations/:id/sync, /logs | TriggerCRMSync/GetCRMSyncLogs |
| POST/PUT/DELETE | /api/telegram-channels[/:id] | Create/Update/DeleteTelegramConnection |
| GET/PUT/POST/DELETE | /api/email-channels/:connectionId[/test] | GetEmailChannelConfig/Upsert/Test/Delete |
| GET/POST/PUT/DELETE | /api/chat-widgets[/:id] | List/Create/Update/DeleteChatWidget |
| GET | /api/chat-widgets/:id/embed-code | GetWidgetEmbedCode |

### Contatos
| Method | Path | Handler |
|---|---|---|
| GET | /api/contacts/groups-live | ListLiveGroups |
| GET/POST/PUT/DELETE | /api/contacts[/:contactId] | GetContacts/CreateContact/UpdateContact/DeleteContact |
| POST | /api/contacts/sync, /verify, /info, /block | SyncContacts/IsOnWhatsApp/GetUserInfo/BlockContact |
| DELETE | /api/contacts/delete-all, /block | DeleteAllContacts/UnblockContact |
| GET | /api/contacts/blocklist, /export | GetBlocklist/ExportContactsReport |
| POST | /api/contacts/export-groups-members | ExportMultipleGroupMembersReport |
| POST | /api/contacts/:contactId/refresh | RefreshContactInfo |
| GET/POST/DELETE | /api/contacts/:contactId/notes[/:id] | List/Create/DeleteContactNote |
| GET/DELETE | /api/contacts/:contactId/lgpd/export, /lgpd/anonymize | ExportContactData/AnonymizeContact |
| GET | /api/contacts/dedup/find, /validate | FindDuplicateContacts/ValidateLIDMappings |
| POST | /api/contacts/dedup/merge, /cleanup, /migrate-lid | MergeContacts/CleanupDuplicatesAuto/MigrateLIDContacts |
| GET/POST/PUT/DELETE | /api/contacts/:contactId/memory[/:memoryId] | Get/Add/Update/DeleteContactMemory |
| GET/POST | /api/contacts/:contactId/wallet[/transactions] | GetContactWallet/ListWalletTransactions/CreateWalletTransaction |

### Grupos WhatsApp / Reações / Presença / Perfil / Advanced
| Method | Path | Handler |
|---|---|---|
| POST/PATCH/DELETE/GET | /api/groups[/:jid][/participants\|/name\|/leave\|/description\|/announce\|/locked\|/member-add-mode] | CreateGroup/UpdateGroupParticipants/... |
| POST | /api/reactions, /reactions/read, /reactions/revoke | SendReaction/MarkAsRead/RevokeMessage |
| POST | /api/presence/send, /chat, /subscribe | SendPresence/SendChatPresence/SubscribePresence |
| GET/PUT | /api/profile/picture[/:jid], /status, /privacy | Get/SetProfilePicture, SetStatusMessage, Get/SetPrivacySetting |
| GET | /api/business/profile/:jid | GetBusinessProfile |
| POST | /api/advanced/disappearing, /media/download | SetDisappearingTimer/DownloadMedia |
| POST/GET/DELETE | /api/groups/:jid/invite-link, /join, /info-from-link | GetGroupInviteLink/JoinGroupWithLink/GetGroupInfoFromLink |
| GET/POST/DELETE | /api/groups/auto-join[/:id][/stats\|/config\|/clear\|/retry-failed] | ListGroupJoinQueue/AddGroupJoinQueue/... |

### Webhooks / Gateway
| Method | Path | Handler |
|---|---|---|
| POST | /api/webhooks/mercadopago, /asaas | MPWebhook/AsaasWebhook |
| GET/POST | /api/webhooks/meta | VerifyMetaWebhook/HandleMetaWebhook |
| POST/GET/DELETE | /api/gateway/register, /unregister, /signup-config, /signup-callback, /receive-credentials | GatewayRegisterRoute/... |
| GET/POST/PUT/DELETE | /api/webhooks[/:id][/logs] | GetWebhooks/CreateWebhook/UpdateWebhook/DeleteWebhook/GetWebhookLogs |
| POST | /api/webhooks/telegram/:connectionId, /sms/:connectionId, /sms-textbee/:connectionId, /sms-notificame/:connectionId, /notificame/:connectionId, /flow/:token | Handle*Webhook |
| POST | /api/finance/webhook/asaas-payment | AsaasFinanceWebhook |

### Templates de Mensagem / WABA Templates
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/templates[/:id] | Get/Create/Update/DeleteTemplate |
| GET | /api/templates/shortcut/:shortcut | GetTemplateByShortcut |
| GET/POST/PUT/DELETE | /api/waba-templates[/:id] | List/Get/Create/EditWABATemplate |
| GET | /api/waba-templates/sync | SyncWABATemplates |
| POST | /api/waba-templates/:id/duplicate, /send, /send-bulk | DuplicateWABATemplate/SendWABATemplate/SendWABATemplateBulk |

### Quick Replies / Media Library / Scheduled Messages
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/quick-replies[/:id] | Get/Create/Update/DeleteQuickReply |
| GET | /api/quick-replies/shortcut/:shortcut | GetQuickReplyByShortcut |
| POST/DELETE | /api/quick-replies/upload, /:id/media/:mediaId | UploadQuickReplyMedia/DeleteQuickReplyMediaItem |
| GET/POST/DELETE | /api/media-library[/:id] | Get/UploadMediaLibraryItem/DeleteMediaLibraryItem |
| POST | /api/media-library/:id/send, /revalidate | SendMediaLibraryItem/RevalidateMediaLibraryItem |
| GET/POST/PUT/DELETE | /api/scheduled-messages[/:id] | Get/Create/Update/DeleteScheduledMessage |
| GET/POST | /api/scheduled-messages/by-contact, /:id/cancel | GetScheduledMessagesForContact/CancelScheduledMessage |

### Campanhas / Broadcasts de Grupo / Follow-up
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/campaigns[/:id] | Get/Create/Update/DeleteCampaign |
| GET | /api/campaigns/csv-template, /:id/stats, /contacts, /logs, /groups, /engagement, /flow-analytics, /flow-responses, /export-responses | ... |
| POST | /api/campaigns/:id/contacts, /start, /pause, /cancel, /duplicate, /import-csv, /import-text, /groups, /send-to-groups | ... |
| GET/POST | /api/group-broadcasts[/:id][/resend], /export-contacts, /settings, /upload, /templates[/:id] | ... |
| POST | /api/group-engagements/:engagementId/open-ticket | OpenGroupEngagementTicket |
| GET/POST/PUT/DELETE | /api/followup-sequences[/:id][/toggle\|/executions] | Get/Create/Update/DeleteFollowUpSequence |
| POST | /api/followup-executions/:id/cancel | CancelFollowUpExecution |

### Filas / Times / Departamentos / Tags
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/queues[/:id][/users[/:userId]] | GetQueues/CreateQueue/AssignUserToQueue/... |
| GET/POST/PUT/DELETE | /api/teams[/:id][/members[/:userId]] | GetTeams/AddTeamMember/RemoveTeamMember |
| GET/POST/PUT/DELETE | /api/departments[/:id] | GetDepartments/Create/Update/DeleteDepartment |
| GET/POST/PUT/DELETE | /api/tags[/:id][/contacts[/:contactId]\|/tickets[/:ticketId]] | GetTags/CreateTag/AddTagToContact/... |

### Meta CAPI
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/meta-capi/mappings[/:id] | List/Create/Update/DeleteMetaCAPIMapping |
| GET | /api/meta-capi/events, /debug-token | ListMetaCAPIEvents/DebugMetaTokenHandler |
| POST | /api/meta-capi/test, /create-pixel, /refresh-token, /send-verification, /test-payload, /seed-funnel | ... |

### Usuários
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/users[/:id] | GetUsers/GetUser/CreateUser/UpdateUser/DeleteUser |
| GET | /api/users/:id/queues | GetUserQueues |
| POST | /api/users/:id/reset-permissions, /avatar | ResetUserPermissions/AdminUploadUserAvatar |

### CRM / Leads / Deals / Pipelines
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/crm/pipelines[/:id][/stages[/:stageId]] | ... |
| GET/POST/PUT/DELETE | /api/crm/deals[/:id][/notes] | ... |
| GET | /api/crm/leads[/:id][/stats\|/ranking\|/loss-reasons\|/export] | ... |
| POST/PUT/DELETE | /api/crm/leads[/:id][/bulk-update-status\|/import-csv] | ... |
| GET/POST/PUT/DELETE | /api/crm/leads/:leadId/interactions, /tasks[/:taskId] | ... |
| GET/POST | /api/crm/lead-pipelines | GetLeadPipelines/CreateLeadPipeline |

### Flow Builder
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/flows[/:id] | List/Get/Create/Update/DeleteFlow |
| POST/GET | /api/flows/:id/duplicate, /executions, /analytics, /results[/export], /execute | ... |
| POST | /api/flows/upload-media, /:id/webhook-token, /import/n8n, /import/validate, /generate-ai | ... |

### IA / Agentes / Transcrição
| Method | Path | Handler |
|---|---|---|
| POST | /api/transcription/transcribe | TranscribeAudio |
| POST | /api/ai/translate/text, /translate/message/:id, /image/analyze, /image/ocr, /tickets/assist, /chat, /suggest, /test/:provider, /tickets/chat | ... |
| GET | /api/ai/providers | GetAIProviders |
| GET/POST | /api/ai/agent/:agent_id/conversation, /chat | CopilotAgentGetConversation/CopilotAgentChat |
| GET/POST/PUT/DELETE | /api/ai-agents[/:id] | List/Get/Create/Update/DeleteAgent |
| GET/POST | /api/ai-agents/templates/list, /from-template | ListAIAgentTemplates/ApplyAIAgentTemplate |
| POST/GET | /api/ai-agents/:id/assets/upload, /chat, /conversations/:convId, /quick-chat, /providers/list | ... |
| GET/POST/PUT/DELETE | /api/ai-agents/:id/knowledge/categories[/:catId][/items[/:itemId]] | ... |
| POST/GET | /api/ai-agents/:id/knowledge/import, /search, /brain, /learn[/progress\|/eligible-tickets], /context/:contactId, /audit-logs | ... |
| GET/POST | /api/agent-approvals[/pending-count], /:id/approve, /:id/reject | ... |

### RAG / Base de Conhecimento
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/knowledge-bases[/:id] | List/Get/Create/Update/DeleteKnowledgeBase |
| POST | /api/knowledge-bases/query, /:id/set-default | QueryKnowledgeBase/SetDefaultKnowledgeBase |
| GET/POST/DELETE | /api/knowledge-bases/:kbId/documents[/:docId][/upload\|/text\|/url\|/reprocess] | ... |
| POST | /api/knowledge-bases/:kbId/search | SearchKnowledgeBase |

### Motivos de Reabertura / NPS
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/reopen-reasons[/:id][/stats\|/seed] | ... |
| GET | /api/nps[/stats\|/timeline\|/by-user\|/by-queue] | ... |

### Chat Interno
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/internal-chat/groups[/:id][/members[/:memberId]] | ... |
| POST | /api/internal-chat/groups/sync-queues, /:id/messages, /:id/read, /upload | ... |
| GET/POST | /api/internal-chat/conversations[/:userId][/read] | ... |
| GET | /api/internal-chat/unread, /online-users | ... |

### Backups / Auditoria
| Method | Path | Handler |
|---|---|---|
| GET/POST/DELETE | /api/backups[/:id][/download] | ListBackups/CreateBackup/GetBackup/DownloadBackup/DeleteBackup |
| GET | /api/audit-logs | ListAuditLogs |

### Settings / White-label
| Method | Path | Handler |
|---|---|---|
| GET/PUT | /api/settings/features, /company, /proxy, /system, /integration-settings[/ai-health-check] | ... |
| POST | /api/settings/company/logo, /white-label[/logo\|/background] | ... |
| GET | /api/settings/plans, /subscription | GetPlans/GetCompanySubscription |
| GET/POST/PUT/DELETE | /api/settings/integrations[/:id] | ... |

### Dashboard / Notificações
| Method | Path | Handler |
|---|---|---|
| GET | /api/dashboard/stats, /my-transfers | GetCompanyDashboardStats/GetMyTransferStats |
| GET/PUT/DELETE | /api/dashboard/layout | GetDashboardLayout/UpdateDashboardLayout/ResetDashboardLayout |
| GET/POST/PUT | /api/notifications[/:id/read][/settings] | ... |

### Admin (Super Admin) — resumido (65 rotas)
Empresas, changelog, assinaturas, faturas, audit-logs, webhook-routes, system-settings, SaaS metrics, alertas, notificações de plataforma, bug-reports, billing (Mercado Pago), ativar/bloquear/impersonar empresa, cupons, afiliados, performance scan, rotas de teste de assinatura (`/api/admin/testing/*`), custom-plan-config. Referência histórica do Evoticket — a maior parte (billing recorrente, cupons, afiliados) está **fora do escopo** do whaticket-1; ver seção de gap "Licenciamento simples".

### Billing (Mercado Pago) / Cupons
| Method | Path | Handler |
|---|---|---|
| GET/POST | /api/billing/status, /checkout, /custom-plan-config, /custom-plan/checkout, /subscriptions[/:id][/cancel\|/pause\|/payments] | ... |
| POST | /api/coupons/validate, /apply, /apply-and-activate | ... |

### Privacy Guard
| Method | Path | Handler |
|---|---|---|
| GET/POST | /api/privacy/violations[/:id/resolve], /me/blocked, /pending-count, /blocked-users, /users/:userId/release | ... |

### Calls
| Method | Path | Handler |
|---|---|---|
| GET | /api/calls/recordings/:id | StreamRecording |
| POST/GET | /api/calls/make, /:callId/end\|answer\|reject\|transfer\|transfer-queue\|hold, /eligible-agents, /active, /history, /logs[/:id/recording-url], /metrics | ... |
| GET/POST/PUT/DELETE | /api/calls/hold-music[/:id] | ... |
| GET/POST | /api/calls/asterisk/config, /originate, /hangup | ... |

### Financeiro (Finance module) — resumido (~65 rotas)
Dashboard, settings, ai-config, categorias, clientes, recebíveis (+pagamentos/observações/cobrança/renegociação/histórico), pagáveis (+anexos), relatórios (aging/cashflow/DRE/top-debtors/payment-methods/revenue-by-category/monthly-comparison/tax), validação CPF/CNPJ, PIX via Asaas, NFS-e (settings/issue/cancel/list), conciliação bancária, dunning (settings/churn-risk/analytics), contas, centros de custo, transações, IA (predictions/timing/summary/anomalies), templates, chat-command (linguagem natural). Ver seção de gap "Módulo Financeiro".

### Push Notifications
| Method | Path | Handler |
|---|---|---|
| GET | /api/push/vapid-public-key | GetVAPIDPublicKey |
| POST/GET | /api/push/subscribe, /unsubscribe, /subscriptions, /test | ... |

### Meta Channels / Embedded Signup / Google Embedded Login
| Method | Path | Handler |
|---|---|---|
| GET/POST | /api/meta-channels/status, /test/:channel, /send, /discover, /select-facebook-page, /select-instagram-account, /exchange-token, /templates[/:connectionId], /send-template, /profile, /generate-webhook-token, /webhook-token | ... |
| PUT/DELETE | /api/meta-channels/templates/:connectionId[/:templateId\|/:templateName] | ... |
| GET/POST | /api/embedded-signup/oauth-redirect, /status, /config, /callback, /session-info, /refresh-token/:id, /wabas, /phone-numbers, /subscribe-webhook/:connectionId | ... |
| GET/POST | /api/google-embedded/oauth-redirect, /config, /initiate, /complete, /status | ... |

### Propostas / Contratos
| Method | Path | Handler |
|---|---|---|
| GET/POST/PUT/DELETE | /api/proposal-templates[/:id] | ... |
| GET/POST/PUT/DELETE | /api/proposals[/:id][/send\|/status\|/pdf] | ... |
| GET/POST/PUT/DELETE | /api/contracts[/:id][/sign\|/pdf] | ... |

### Atendentes / Calendário / Google Sheets
| Method | Path | Handler |
|---|---|---|
| GET/PUT | /api/attendants/stats, /ranking, /distribution-settings | ... |
| GET/POST/PUT/DELETE | /api/calendar/oauth/*, /integrations[/:id][/sync], /events[/:id][/today\|/upcoming\|/pending/count\|/seen\|/import/*], /meet | ... |
| GET/DELETE | /api/google-sheets/oauth/google, /status, /disconnect, /oauth/callback | ... |

### Reports / Chip Warmup / Misc
| Method | Path | Handler |
|---|---|---|
| GET | /api/reports/tickets, /agents, /export/*, /ratings | ... |
| GET/POST/PUT/DELETE | /api/chip-warmup/sessions[/:id][/start\|/pause\|/resume\|/stats] | ... |
| GET | /api/version | GetVersion |
| GET/POST/PUT/DELETE | /api/announcements[/:id][/active] | ... |
| GET | /api/changelog | ListPublishedChangelog |
| GET/POST/PUT/DELETE | /api/prompts[/:id] | ... |

---

## Notas e observações

- **Kafka não está em uso.** Apesar de existir o pacote `internal/kafka` (wrapper Sarama para tópicos `message.send`/`message.status`/`message.delivery`), nenhuma rota ou fluxo principal do `routes.go` referencia Kafka. É um subsistema desativado/experimental — não recomendamos portar.
- **Licenciamento (`internal/license` + `LicenseMiddleware`) bloqueia literalmente toda a API** se a licença estiver inválida/expirada. Isso é adequado para um produto comercial fechado vendido a clientes finais, mas é uma decisão de arquitetura pesada — só faz sentido portar se o whaticket-1 for virar um produto SaaS vendido/licenciado. Caso contrário, ignorar completamente esse módulo (e o servidor de licença externo, fora do escopo deste relatório).
- **Multi-tenant é a decisão arquitetural mais impactante.** Praticamente toda tabela do Evoticket tem `company_id`. Migrar qualquer feature "as-is" implica decidir cedo se o whaticket-1 vai virar multi-tenant (isolamento de dados por empresa) ou se cada feature deve ser simplificada para instalação única. Recomenda-se decidir isso antes de iniciar a migração de qualquer módulo grande (CRM, Boards, Finance, IA), pois todos assumem `company_id` nos models e nas permissões.
- **O módulo de IA é o maior e mais arriscado de portar.** Envolve múltiplos providers de LLM, RAG com pgvector, autonomia com aprovação humana, guardrails de privacidade e "aprendizado" — é essencialmente um produto à parte dentro do Evoticket. Recomenda-se fatiar fortemente: começar com "sugerir resposta" (single-provider, sem RAG, sem autonomia) e evoluir depois.
- **Módulo financeiro é fortemente verticalizado para o Brasil** (NFS-e, CPF/CNPJ, PIX, Asaas, Mercado Pago). Só faz sentido se o whaticket-1 mantiver foco no mercado brasileiro; do contrário, é bom candidato a nem portar.
- **Anti-ban/chip warm-up é sofisticado** (simulação de comportamento humano, monitor de reputação/confiança, variação de conteúdo, rate limiting adaptativo) — isso sugere que o Evoticket sofreu com bloqueios de número em produção; se o whaticket-1 pretende fazer disparo em massa/campanhas, vale portar ao menos os princípios básicos (rate limiting adaptativo, variação de conteúdo) mesmo sem o sistema completo.
- **`internal/routes/routes.go` é um único arquivo de ~2150 linhas** registrando todas as rotas — ao contrário do padrão "um arquivo de rotas por feature" mais comum; útil saber isso para quem for ler o código-fonte original durante a migração.
- **Segurança SSRF (`internal/security/ssrf.go`)**: qualquer feature que aceite URL fornecida pelo usuário para o backend chamar (webhooks, nós HTTP do Flow Builder) deve reutilizar essa proteção — validação de IP privado/loopback/link-local antes de fazer o request. Vale portar isso independente de qual feature for implementada primeiro, pois é puramente defensivo e de baixo custo.
- **Fila assíncrona (Asynq/Redis) com processo `worker` separado do `api`** é um padrão arquitetural que vale adotar cedo no whaticket-1 assim que a primeira feature assíncrona pesada for implementada (campanhas, IA, importação de dados), evitando que o processo principal da API fique bloqueado.
- **2FA, deduplicação de contatos/LID, LGPD export/anonymize e SLA/CSAT/NPS** são os itens de menor esforço e maior valor imediato — bons candidatos para as primeiras fatias de migração, pois incrementam o módulo de Tickets/Contatos já existente sem exigir decisões arquiteturais grandes (multi-tenant, licenciamento, fila assíncrona).
- Conforme instrução de escopo, este relatório **não cobre `mobile/` (app Flutter) nem `license-server/`** (produto separado de fleet/licensing) — caso sejam necessários no futuro, exigem exploração à parte.
