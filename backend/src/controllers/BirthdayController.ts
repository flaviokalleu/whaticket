import { Request, Response } from "express";

import GetBirthdaySettingsService from "../services/BirthdayService/GetBirthdaySettingsService";
import UpdateBirthdaySettingsService from "../services/BirthdayService/UpdateBirthdaySettingsService";
import ListUpcomingBirthdaysService from "../services/BirthdayService/ListUpcomingBirthdaysService";
import ListTodayBirthdaysService from "../services/BirthdayService/ListTodayBirthdaysService";

export const getSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const settings = await GetBirthdaySettingsService(companyId);

  return res.status(200).json(settings);
};

export const updateSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { isEnabled, messageTemplate, sendHour, whatsappId } = req.body;

  const settings = await UpdateBirthdaySettingsService({
    companyId,
    isEnabled,
    messageTemplate,
    sendHour,
    whatsappId
  });

  return res.status(200).json(settings);
};

export const upcoming = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { daysAhead } = req.query;

  const contacts = await ListUpcomingBirthdaysService({
    companyId,
    daysAhead: daysAhead ? Number(daysAhead) : undefined
  });

  return res.status(200).json(contacts);
};

export const today = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const contacts = await ListTodayBirthdaysService({ companyId });

  return res.status(200).json(contacts);
};
