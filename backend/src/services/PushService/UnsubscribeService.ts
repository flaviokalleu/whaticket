import PushSubscription from "../../models/PushSubscription";

interface Request {
  userId: number;
  companyId: number;
  endpoint: string;
}

const UnsubscribeService = async ({
  userId,
  companyId,
  endpoint
}: Request): Promise<void> => {
  await PushSubscription.destroy({
    where: { userId, companyId, endpoint }
  });
};

export default UnsubscribeService;
