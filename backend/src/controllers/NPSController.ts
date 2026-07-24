import { Request, Response } from "express";
import CreateNPSResponseService from "../services/NPSService/CreateNPSResponseService";
import GetNPSStatsService from "../services/NPSService/GetNPSStatsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId, ticketId, score, comment } = req.body;

  const npsResponse = await CreateNPSResponseService({
    contactId,
    ticketId,
    score,
    comment,
    companyId
  });

  return res.status(200).json(npsResponse);
};

export const stats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { startDate, endDate } = req.query as {
    startDate?: string;
    endDate?: string;
  };

  const npsStats = await GetNPSStatsService({ companyId, startDate, endDate });

  return res.status(200).json(npsStats);
};
