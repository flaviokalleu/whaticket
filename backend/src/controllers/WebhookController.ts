import { Request, Response } from "express";
import CreateWebhookService from "../services/WebhookService/CreateWebhookService";
import ListWebhooksService from "../services/WebhookService/ListWebhooksService";
import ShowWebhookService from "../services/WebhookService/ShowWebhookService";
import UpdateWebhookService from "../services/WebhookService/UpdateWebhookService";
import DeleteWebhookService from "../services/WebhookService/DeleteWebhookService";
import ListWebhookLogsService from "../services/WebhookService/ListWebhookLogsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const webhooks = await ListWebhooksService({ companyId });

  return res.status(200).json(webhooks);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, url, events, isActive, secret } = req.body;

  const webhook = await CreateWebhookService({
    companyId,
    name,
    url,
    events,
    isActive,
    secret
  });

  return res.status(200).json(webhook);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const webhook = await ShowWebhookService({ webhookId: id, companyId });

  return res.status(200).json(webhook);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { name, url, events, isActive, secret } = req.body;

  const webhook = await UpdateWebhookService({
    webhookId: id,
    companyId,
    name,
    url,
    events,
    isActive,
    secret
  });

  return res.status(200).json(webhook);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteWebhookService({ webhookId: id, companyId });

  return res.status(200).json({ message: "Webhook deleted" });
};

export const logs = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { pageNumber } = req.query;

  const result = await ListWebhookLogsService({
    webhookId: id,
    companyId,
    pageNumber: pageNumber as string
  });

  return res.status(200).json(result);
};
