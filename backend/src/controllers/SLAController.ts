import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import UpdateQueueSLAService from "../services/QueueService/UpdateQueueSLAService";
import GetTicketsAtRiskService from "../services/TicketServices/GetTicketsAtRiskService";
import GetSLAStatsService from "../services/TicketServices/GetSLAStatsService";

export const stats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const slaStats = await GetSLAStatsService({ companyId });

  return res.status(200).json(slaStats);
};

export const atRisk = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const tickets = await GetTicketsAtRiskService({ companyId });

  return res.status(200).json(tickets);
};

export const updateQueueSLA = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { queueId } = req.params;
  const { slaMinutes, slaResolutionMinutes } = req.body;

  const queue = await UpdateQueueSLAService({
    companyId,
    queueId,
    slaMinutes,
    slaResolutionMinutes
  });

  const io = getIO();
  io.emit("queue", {
    action: "update",
    queue
  });

  return res.status(200).json(queue);
};
