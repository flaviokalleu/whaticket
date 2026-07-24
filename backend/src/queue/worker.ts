import { Job, Worker } from "bullmq";

import { logger } from "../utils/logger";
import connection from "./connection";
import {
  CampaignJobData,
  ScheduledMessageJobData,
  WebhookJobData,
  GenericJobData
} from "./types";
import Campaign from "../models/Campaign";
import CampaignContact from "../models/CampaignContact";
import CampaignLog from "../models/CampaignLog";
import Contact from "../models/Contact";
import formatBody from "../helpers/Mustache";
import { whatsappProvider } from "../providers/WhatsApp";
import ExecuteFlowService from "../services/FlowService/ExecuteFlowService";

// Each processor below is intentionally a small, named, standalone function
// so a future PR implementing the real scheduled-message/webhook logic can
// fill it in without needing to touch the worker wiring/structure.

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

export const processCampaignJob = async (job: Job<CampaignJobData>) => {
  const { companyId, campaignId } = job.data;

  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId }
  });

  if (!campaign) {
    logger.warn(
      `processCampaignJob: campaign ${campaignId} (company ${companyId}) not found, skipping`
    );
    return;
  }

  if (campaign.status !== "running") {
    logger.info(
      `processCampaignJob: campaign ${campaignId} is not running (status ${campaign.status}), skipping`
    );
    return;
  }

  const pendingContacts = await CampaignContact.findAll({
    where: { campaignId, companyId, status: "pending" },
    include: [{ model: Contact }]
  });

  const intervalMs = Math.max(campaign.intervalSeconds, 1) * 1000;

  // eslint-disable-next-line no-restricted-syntax
  for (const campaignContact of pendingContacts) {
    // Re-fetch the campaign's current status before every send so a
    // pause/cancel issued mid-run is honored without processing the
    // remaining contacts.
    // eslint-disable-next-line no-await-in-loop
    const current = await Campaign.findOne({
      where: { id: campaignId, companyId }
    });

    if (!current || current.status !== "running") {
      logger.info(
        `processCampaignJob: campaign ${campaignId} no longer running, stopping mid-run`
      );
      return;
    }

    const { contact } = campaignContact;

    try {
      if (!contact || !contact.number) {
        throw new Error("Contact has no number");
      }

      const chatId = `${contact.number}@${contact.isGroup ? "g" : "c"}.us`;
      // mediaUrl is stored as a plain URL (not an uploaded file), so it is
      // appended to the text body rather than sent through sendMedia, which
      // expects a local file path/buffer from a multipart upload.
      const rawBody = campaign.mediaUrl
        ? `${campaign.body}\n${campaign.mediaUrl}`
        : campaign.body;
      const body = formatBody(rawBody, contact);

      // eslint-disable-next-line no-await-in-loop
      await whatsappProvider.sendMessage(campaign.whatsappId, chatId, body, {
        linkPreview: !!campaign.mediaUrl
      });

      // eslint-disable-next-line no-await-in-loop
      await campaignContact.update({ status: "sent", sentAt: new Date() });
    } catch (err) {
      logger.error({
        info: `processCampaignJob: failed to send campaign ${campaignId} message to contact ${campaignContact.contactId}`,
        err
      });

      // eslint-disable-next-line no-await-in-loop
      await campaignContact.update({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : String(err)
      });

      // eslint-disable-next-line no-await-in-loop
      await CampaignLog.create({
        campaignId,
        companyId,
        event: "error",
        message: `Failed to send to contact ${campaignContact.contactId}: ${
          err instanceof Error ? err.message : String(err)
        }`
      } as CampaignLog);
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(intervalMs);
  }

  const finalCampaign = await Campaign.findOne({
    where: { id: campaignId, companyId }
  });

  if (finalCampaign && finalCampaign.status === "running") {
    await finalCampaign.update({ status: "completed" });
    await CampaignLog.create({
      campaignId,
      companyId,
      event: "completed",
      message: "Campaign finished sending to all pending contacts"
    } as CampaignLog);
  }
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
  const { companyId, type, payload } = job.data;

  if (type === "flow-execute") {
    const { flowId, executionId } = payload as {
      flowId: number;
      executionId: number;
    };
    await ExecuteFlowService(flowId, executionId, companyId);
    return;
  }

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
