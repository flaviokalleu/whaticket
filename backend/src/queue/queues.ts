import { Queue } from "bullmq";

import connection from "./connection";
import {
  CampaignJobData,
  ScheduledMessageJobData,
  WebhookJobData,
  GenericJobData
} from "./types";

// Named BullMQ queues that upcoming features push jobs into.
//
// IMPORTANT CONVENTION: every job payload added to any of these queues MUST
// include `companyId` as a top-level field (see ./types.ts). This is a
// multi-tenant system, and every consumer/processor is expected to scope its
// work by `companyId`. Do not add jobs without it.
//
// Usage example (from a future service):
//   import { campaignQueue } from "../queue/queues";
//   await campaignQueue.add("send", { companyId, campaignId });

export const campaignQueue = new Queue<CampaignJobData>("campaign", {
  connection
});

export const scheduledMessageQueue = new Queue<ScheduledMessageJobData>(
  "scheduled-message",
  { connection }
);

export const webhookQueue = new Queue<WebhookJobData>("webhook", {
  connection
});

// Catch-all queue for anything not yet categorized into its own queue.
export const genericQueue = new Queue<GenericJobData>("generic", {
  connection
});
