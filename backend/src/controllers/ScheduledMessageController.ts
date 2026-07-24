import { Request, Response } from "express";

import CreateScheduledMessageService from "../services/ScheduledMessageService/CreateScheduledMessageService";
import ListScheduledMessagesService from "../services/ScheduledMessageService/ListScheduledMessagesService";
import ShowScheduledMessageService from "../services/ScheduledMessageService/ShowScheduledMessageService";
import UpdateScheduledMessageService from "../services/ScheduledMessageService/UpdateScheduledMessageService";
import DeleteScheduledMessageService from "../services/ScheduledMessageService/DeleteScheduledMessageService";
import CancelScheduledMessageService from "../services/ScheduledMessageService/CancelScheduledMessageService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const scheduledMessages = await ListScheduledMessagesService({ companyId });

  return res.status(200).json(scheduledMessages);
};

export const listByContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId } = req.params;

  const scheduledMessages = await ListScheduledMessagesService({
    companyId,
    contactId
  });

  return res.status(200).json(scheduledMessages);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const scheduledMessage = await ShowScheduledMessageService({
    id,
    companyId
  });

  return res.status(200).json(scheduledMessage);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const {
    ticketId,
    contactId,
    whatsappId,
    body,
    mediaUrl,
    scheduledFor
  } = req.body;

  const scheduledMessage = await CreateScheduledMessageService({
    ticketId,
    contactId,
    whatsappId,
    body,
    mediaUrl,
    scheduledFor,
    createdBy: +userId,
    companyId
  });

  return res.status(200).json(scheduledMessage);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const scheduledMessage = await UpdateScheduledMessageService({
    id,
    companyId,
    ...req.body
  });

  return res.status(201).json(scheduledMessage);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteScheduledMessageService({ id, companyId });

  return res.status(200).send();
};

export const cancel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const scheduledMessage = await CancelScheduledMessageService({
    id,
    companyId
  });

  return res.status(200).json(scheduledMessage);
};
