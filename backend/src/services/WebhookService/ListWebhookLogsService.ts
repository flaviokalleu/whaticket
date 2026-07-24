import WebhookLog from "../../models/WebhookLog";
import ShowWebhookService from "./ShowWebhookService";

interface Request {
  webhookId: number | string;
  companyId: number;
  pageNumber?: string | number;
}

interface Response {
  logs: WebhookLog[];
  count: number;
  hasMore: boolean;
}

const PER_PAGE = 20;

const ListWebhookLogsService = async ({
  webhookId,
  companyId,
  pageNumber = "1"
}: Request): Promise<Response> => {
  // Ensures the webhook belongs to the requesting company before listing logs.
  await ShowWebhookService({ webhookId, companyId });

  const offset = (+pageNumber - 1) * PER_PAGE;

  const { count, rows: logs } = await WebhookLog.findAndCountAll({
    where: { webhookId },
    limit: PER_PAGE,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + logs.length;

  return { logs, count, hasMore };
};

export default ListWebhookLogsService;
