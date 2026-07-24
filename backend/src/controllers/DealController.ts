import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateDealService from "../services/DealService/CreateDealService";
import ListDealsService from "../services/DealService/ListDealsService";
import ShowDealService from "../services/DealService/ShowDealService";
import UpdateDealService from "../services/DealService/UpdateDealService";
import DeleteDealService from "../services/DealService/DeleteDealService";
import MoveDealStageService from "../services/DealService/MoveDealStageService";
import CreateDealNoteService from "../services/DealService/CreateDealNoteService";
import ListDealNotesService from "../services/DealService/ListDealNotesService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { pipelineId, stageId, status } = req.query;

  const deals = await ListDealsService({
    companyId,
    pipelineId: pipelineId as string,
    stageId: stageId as string,
    status: status as string
  });

  return res.status(200).json(deals);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { pipelineId, stageId, contactId, title, value, userId } = req.body;

  const deal = await CreateDealService({
    pipelineId,
    stageId,
    contactId,
    title,
    value,
    userId,
    companyId
  });

  const io = getIO();
  io.emit("deal", {
    action: "update",
    deal
  });

  return res.status(200).json(deal);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const deal = await ShowDealService(id, companyId);

  return res.status(200).json(deal);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const deal = await UpdateDealService(id, companyId, req.body);

  const io = getIO();
  io.emit("deal", {
    action: "update",
    deal
  });

  return res.status(201).json(deal);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteDealService(id, companyId);

  const io = getIO();
  io.emit("deal", {
    action: "delete",
    dealId: +id
  });

  return res.status(200).send();
};

export const move = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { stageId } = req.body;

  const deal = await MoveDealStageService(id, stageId, companyId);

  const io = getIO();
  io.emit("deal", {
    action: "update",
    deal
  });

  return res.status(200).json(deal);
};

export const indexNotes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const notes = await ListDealNotesService(id, companyId);

  return res.status(200).json(notes);
};

export const storeNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id } = req.params;
  const { body } = req.body;

  const note = await CreateDealNoteService({
    dealId: id,
    userId: +userId,
    companyId,
    body
  });

  const io = getIO();
  io.emit("deal", {
    action: "update-note",
    note
  });

  return res.status(200).json(note);
};
