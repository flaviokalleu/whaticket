import webpush from "web-push";
import PushSubscription from "../../models/PushSubscription";
import webPushConfig from "../../config/webPush";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  userId: number;
  title: string;
  body: string;
  url?: string;
}

let vapidConfigured = false;

const ensureVapidConfigured = (): boolean => {
  if (!webPushConfig.publicKey || !webPushConfig.privateKey) {
    logger.warn(
      "SendPushToUserService: VAPID keys are not configured, skipping push"
    );
    return false;
  }

  if (!vapidConfigured) {
    webpush.setVapidDetails(
      webPushConfig.subject,
      webPushConfig.publicKey,
      webPushConfig.privateKey
    );
    vapidConfigured = true;
  }

  return true;
};

const SendPushToUserService = async ({
  companyId,
  userId,
  title,
  body,
  url
}: Request): Promise<void> => {
  if (!ensureVapidConfigured()) {
    return;
  }

  const subscriptions = await PushSubscription.findAll({
    where: { companyId, userId }
  });

  const payload = JSON.stringify({ title, body, url });

  await Promise.all(
    subscriptions.map(async subscription => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          payload
        );
      } catch (err) {
        const statusCode = err?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await subscription.destroy();
        } else {
          logger.warn(
            err,
            `SendPushToUserService: failed to send push to subscription ${subscription.id}`
          );
        }
      }
    })
  );
};

export default SendPushToUserService;
