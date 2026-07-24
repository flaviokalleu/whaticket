import PushSubscription from "../../models/PushSubscription";

interface Request {
  userId: number;
  companyId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

const SubscribeService = async ({
  userId,
  companyId,
  endpoint,
  p256dh,
  auth
}: Request): Promise<PushSubscription> => {
  const [subscription] = await PushSubscription.findOrCreate({
    where: { userId, companyId, endpoint },
    defaults: { userId, companyId, endpoint, p256dh, auth }
  });

  if (subscription.p256dh !== p256dh || subscription.auth !== auth) {
    await subscription.update({ p256dh, auth });
  }

  return subscription;
};

export default SubscribeService;
