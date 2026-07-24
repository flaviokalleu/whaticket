import ShowWebhookService from "./ShowWebhookService";

interface Request {
  webhookId: number | string;
  companyId: number;
}

const DeleteWebhookService = async ({
  webhookId,
  companyId
}: Request): Promise<void> => {
  const webhook = await ShowWebhookService({ webhookId, companyId });

  await webhook.destroy();
};

export default DeleteWebhookService;
