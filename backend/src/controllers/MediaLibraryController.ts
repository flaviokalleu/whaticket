import { Request, Response } from "express";

import CreateMediaLibraryItemService from "../services/MediaLibraryService/CreateMediaLibraryItemService";
import ListMediaLibraryItemsService from "../services/MediaLibraryService/ListMediaLibraryItemsService";
import DeleteMediaLibraryItemService from "../services/MediaLibraryService/DeleteMediaLibraryItemService";
import SendMediaLibraryItemService from "../services/MediaLibraryService/SendMediaLibraryItemService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const items = await ListMediaLibraryItemsService({ companyId });

  return res.status(200).json(items);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { name } = req.body;
  const media = (req.files as Express.Multer.File[])?.[0];

  const item = await CreateMediaLibraryItemService({
    name,
    media,
    createdBy: +userId,
    companyId
  });

  return res.status(200).json(item);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteMediaLibraryItemService({ id, companyId });

  return res.status(200).send();
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { ticketId, body } = req.body;

  const sentMessage = await SendMediaLibraryItemService({
    itemId: id,
    ticketId,
    companyId,
    body
  });

  return res.status(200).json(sentMessage);
};
