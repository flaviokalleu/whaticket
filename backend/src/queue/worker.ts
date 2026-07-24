import { Job, Worker } from "bullmq";

import { logger } from "../utils/logger";
import connection from "./connection";
import {
  CampaignJobData,
  ScheduledMessageJobData,
  WebhookJobData,
  GenericJobData
} from "./types";

// Each processor below is intentionally a small, named, standalone function
// so a future PR implementing the real campaign/scheduled-message/webhook
// logic can fill it in without needing to touch the worker wiring/structure.

export const processCampaignJob = async (job: Job<CampaignJobData>) => {
  const { companyId, campaignId } = job.data;
  logger.info(
    `received job ${job.id} for queue campaign, companyId ${companyId}, campaignId ${campaignId}, no processor registered yet`
  );
};

export const processScheduledMessageJob = async (
  job: Job<ScheduledMessageJobData>
) => {
  const { companyId, scheduledMessageId } = job.data;
  logger.info(
    `received job ${job.id} for queue scheduled-message, companyId ${companyId}, scheduledMessageId ${scheduledMessageId}, no processor registered yet`
  );
};

export const processWebhookJob = async (job: Job<WebhookJobData>) => {
  const { companyId, webhookId } = job.data;
  logger.info(
    `received job ${job.id} for queue webhook, companyId ${companyId}, webhookId ${webhookId}, no processor registered yet`
  );
};

export const processGenericJob = async (job: Job<GenericJobData>) => {
  const { companyId, type } = job.data;
  logger.info(
    `received job ${job.id} for queue generic, companyId ${companyId}, type ${type}, no processor registered yet`
  );
};

export const startWorkers = () => {
  const campaignWorker = new Worker<CampaignJobData>(
    "campaign",
    processCampaignJob,
    { connection }
  );

  const scheduledMessageWorker = new Worker<ScheduledMessageJobData>(
    "scheduled-message",
    processScheduledMessageJob,
    { connection }
  );

  const webhookWorker = new Worker<WebhookJobData>(
    "webhook",
    processWebhookJob,
    { connection }
  );

  const genericWorker = new Worker<GenericJobData>(
    "generic",
    processGenericJob,
    { connection }
  );

  [campaignWorker, scheduledMessageWorker, webhookWorker, genericWorker].forEach(
    worker => {
      worker.on("error", err => {
        logger.error({ info: `Worker error on queue ${worker.name}`, err });
      });
    }
  );

  logger.info("BullMQ workers started: campaign, scheduled-message, webhook, generic");

  return {
    campaignWorker,
    scheduledMessageWorker,
    webhookWorker,
    genericWorker
  };
};
