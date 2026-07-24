// Job payload interfaces for each BullMQ queue.
//
// Convention: every job payload MUST include `companyId` as a top-level
// field. This system is multi-tenant, and every consumer/processor must use
// `companyId` to scope its work (queries, side effects, notifications, etc.)
// to the correct tenant. Never process a job without checking `companyId`.

export interface CampaignJobData {
  companyId: number;
  campaignId: number;
}

export interface ScheduledMessageJobData {
  companyId: number;
  scheduledMessageId: number;
}

export interface WebhookJobData {
  companyId: number;
  webhookId: number;
  event: string;
  payload: unknown;
}

export interface GenericJobData {
  companyId: number;
  type: string;
  payload: unknown;
}
