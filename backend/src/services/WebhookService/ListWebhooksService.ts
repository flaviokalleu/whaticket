import Webhook from "../../models/Webhook";

interface Request {
  companyId: number;
}

const ListWebhooksService = async ({
  companyId
}: Request): Promise<Webhook[]> => {
  const webhooks = await Webhook.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]]
  });

  return webhooks;
};

export default ListWebhooksService;
