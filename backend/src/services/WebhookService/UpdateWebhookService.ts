import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Webhook from "../../models/Webhook";
import { assertUrlIsSafe } from "../../helpers/SsrfGuard";
import ShowWebhookService from "./ShowWebhookService";

interface Request {
  webhookId: number | string;
  companyId: number;
  name?: string;
  url?: string;
  events?: string[];
  isActive?: boolean;
  secret?: string;
}

const UpdateWebhookService = async ({
  webhookId,
  companyId,
  name,
  url,
  events,
  isActive,
  secret
}: Request): Promise<Webhook> => {
  const webhook = await ShowWebhookService({ webhookId, companyId });

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    url: Yup.string().url(),
    events: Yup.array().of(Yup.string())
  });

  try {
    await schema.validate({ name, url, events });
  } catch (err) {
    throw new AppError(err.message);
  }

  if (url) {
    await assertUrlIsSafe(url);
  }

  await webhook.update({
    name: name ?? webhook.name,
    url: url ?? webhook.url,
    events: events ?? webhook.events,
    isActive: isActive ?? webhook.isActive,
    secret: secret === undefined ? webhook.secret : secret
  });

  return webhook;
};

export default UpdateWebhookService;
