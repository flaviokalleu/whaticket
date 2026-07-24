import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Webhook from "../../models/Webhook";
import { assertUrlIsSafe } from "../../helpers/SsrfGuard";

interface Request {
  companyId: number;
  name: string;
  url: string;
  events: string[];
  isActive?: boolean;
  secret?: string;
}

const CreateWebhookService = async ({
  companyId,
  name,
  url,
  events,
  isActive = true,
  secret
}: Request): Promise<Webhook> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2).required("ERR_WEBHOOK_INVALID_NAME"),
    url: Yup.string().url().required("ERR_WEBHOOK_INVALID_URL"),
    events: Yup.array()
      .of(Yup.string())
      .min(1, "ERR_WEBHOOK_INVALID_EVENTS")
      .required("ERR_WEBHOOK_INVALID_EVENTS")
  });

  try {
    await schema.validate({ name, url, events });
  } catch (err) {
    throw new AppError(err.message);
  }

  await assertUrlIsSafe(url);

  const webhook = await Webhook.create({
    companyId,
    name,
    url,
    events,
    isActive,
    secret: secret || null
  });

  return webhook;
};

export default CreateWebhookService;
