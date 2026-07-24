import crypto from "crypto";
import axios from "axios";
import { Op } from "sequelize";
import Webhook from "../../models/Webhook";
import WebhookLog from "../../models/WebhookLog";
import { assertUrlIsSafe } from "../../helpers/SsrfGuard";
import { logger } from "../../utils/logger";

const TIMEOUT_MS = 10000;

const signPayload = (secret: string, body: string): string => {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
};

/**
 * Fires the given event to every active webhook subscribed to it for the
 * given company. Meant to be called from other services whenever a
 * significant domain event happens, e.g.:
 *   TriggerWebhooksService({ companyId, event: "ticket.created", payload: ticket })
 * A single webhook failing (network error, SSRF-blocked URL, non-2xx
 * response, etc.) never blocks delivery to the other webhooks.
 */
const TriggerWebhooksService = async ({
  companyId,
  event,
  payload
}: {
  companyId: number;
  event: string;
  payload: object;
}): Promise<void> => {
  const webhooks = await Webhook.findAll({
    where: {
      companyId,
      isActive: true,
      events: { [Op.contains]: [event] }
    }
  });

  if (!webhooks.length) {
    return;
  }

  const body = JSON.stringify({ event, payload, timestamp: new Date() });

  // Each mapped task catches its own errors internally, so a rejection here
  // never happens — this achieves the same "don't let one failure block the
  // others" behavior as Promise.allSettled without requiring an ES2020 lib.
  await Promise.all(
    webhooks.map(async webhook => {
      let statusCode: number | null = null;
      let success = false;
      let responseBody: string | null = null;

      try {
        await assertUrlIsSafe(webhook.url);

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };

        if (webhook.secret) {
          headers["X-Webhook-Signature"] = signPayload(webhook.secret, body);
        }

        const response = await axios.post(webhook.url, body, {
          headers,
          timeout: TIMEOUT_MS,
          validateStatus: () => true
        });

        statusCode = response.status;
        success = response.status >= 200 && response.status < 300;
        responseBody =
          typeof response.data === "string"
            ? response.data.slice(0, 2000)
            : JSON.stringify(response.data).slice(0, 2000);
      } catch (err) {
        success = false;
        responseBody = (err?.message || "Unknown error").slice(0, 2000);
        logger.warn(
          err,
          `TriggerWebhooksService: failed to deliver webhook ${webhook.id} for event ${event}`
        );
      }

      try {
        await WebhookLog.create({
          webhookId: webhook.id,
          event,
          statusCode,
          success,
          payload,
          responseBody
        });
      } catch (err) {
        logger.warn(err, "TriggerWebhooksService: failed to write log");
      }
    })
  );
};

export default TriggerWebhooksService;
