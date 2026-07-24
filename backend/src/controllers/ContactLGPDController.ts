import { Request, Response } from "express";

import ExportContactDataService from "../services/ContactServices/ExportContactDataService";
import AnonymizeContactService from "../services/ContactServices/AnonymizeContactService";

export const exportData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId } = req.params;

  const data = await ExportContactDataService({
    companyId,
    contactId: Number(contactId)
  });

  return res.status(200).json(data);
};

export const anonymize = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId } = req.params;

  const contact = await AnonymizeContactService({
    companyId,
    contactId: Number(contactId)
  });

  return res.status(200).json(contact);
};
