import AppError from "../../errors/AppError";
import Webhook from "../../models/Webhook";

interface Request {
  webhookId: number | string;
  companyId: number;
}

const ShowWebhookService = async ({
  webhookId,
  companyId
}: Request): Promise<Webhook> => {
  const webhook = await Webhook.findOne({
    where: { id: webhookId, companyId }
  });

  if (!webhook) {
    throw new AppError("ERR_WEBHOOK_NOT_FOUND", 404);
  }

  return webhook;
};

export default ShowWebhookService;
