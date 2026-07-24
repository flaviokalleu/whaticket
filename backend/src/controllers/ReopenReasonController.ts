import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateTicketReopenReasonService from "../services/TicketReopenReasonService/CreateTicketReopenReasonService";
import ListTicketReopenReasonsService from "../services/TicketReopenReasonService/ListTicketReopenReasonsService";
import ShowTicketReopenReasonService from "../services/TicketReopenReasonService/ShowTicketReopenReasonService";
import UpdateTicketReopenReasonService from "../services/TicketReopenReasonService/UpdateTicketReopenReasonService";
import DeleteTicketReopenReasonService from "../services/TicketReopenReasonService/DeleteTicketReopenReasonService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const reopenReasons = await ListTicketReopenReasonsService({ companyId });

  return res.status(200).json(reopenReasons);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;

  const reopenReason = await CreateTicketReopenReasonService({
    name,
    companyId
  });

  const io = getIO();
  io.emit("reopenReason", {
    action: "update",
    reopenReason
  });

  return res.status(200).json(reopenReason);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const reopenReason = await ShowTicketReopenReasonService({ id, companyId });

  return res.status(200).json(reopenReason);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { name } = req.body;

  const reopenReason = await UpdateTicketReopenReasonService({
    id,
    companyId,
    name
  });

  const io = getIO();
  io.emit("reopenReason", {
    action: "update",
    reopenReason
  });

  return res.status(200).json(reopenReason);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteTicketReopenReasonService({ id, companyId });

  const io = getIO();
  io.emit("reopenReason", {
    action: "delete",
    reopenReasonId: +id
  });

  return res.status(200).send();
};
