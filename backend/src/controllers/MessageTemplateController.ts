import { Request, Response } from "express";

import CreateMessageTemplateService from "../services/MessageTemplateService/CreateMessageTemplateService";
import ListMessageTemplatesService from "../services/MessageTemplateService/ListMessageTemplatesService";
import ShowMessageTemplateService from "../services/MessageTemplateService/ShowMessageTemplateService";
import UpdateMessageTemplateService from "../services/MessageTemplateService/UpdateMessageTemplateService";
import DeleteMessageTemplateService from "../services/MessageTemplateService/DeleteMessageTemplateService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const templates = await ListMessageTemplatesService({ companyId });

  return res.status(200).json(templates);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const template = await ShowMessageTemplateService({ id, companyId });

  return res.status(200).json(template);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, body } = req.body;

  const template = await CreateMessageTemplateService({
    name,
    body,
    companyId
  });

  return res.status(200).json(template);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const template = await UpdateMessageTemplateService({
    id,
    companyId,
    ...req.body
  });

  return res.status(201).json(template);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteMessageTemplateService({ id, companyId });

  return res.status(200).send();
};
