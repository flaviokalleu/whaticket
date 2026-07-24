import { Request, Response } from "express";

import FindDuplicateContactsService from "../services/ContactServices/FindDuplicateContactsService";
import MergeContactsService from "../services/ContactServices/MergeContactsService";

export const find = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const duplicateGroups = await FindDuplicateContactsService({ companyId });

  return res.status(200).json({ duplicateGroups });
};

export const merge = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { primaryContactId, duplicateContactIds } = req.body;

  const contact = await MergeContactsService({
    companyId,
    primaryContactId,
    duplicateContactIds
  });

  return res.status(200).json(contact);
};
