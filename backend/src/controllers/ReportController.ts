import { Request, Response } from "express";

import GetTicketReportService from "../services/ReportService/GetTicketReportService";

export const tickets = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { startDate, endDate, queueId, userId } = req.query as {
    startDate?: string;
    endDate?: string;
    queueId?: string;
    userId?: string;
  };

  const report = await GetTicketReportService({
    companyId,
    startDate,
    endDate,
    queueId,
    userId
  });

  return res.status(200).json(report);
};
