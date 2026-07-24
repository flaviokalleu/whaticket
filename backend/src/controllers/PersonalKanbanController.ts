import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreatePersonalKanbanLaneService from "../services/PersonalKanbanService/CreatePersonalKanbanLaneService";
import ListPersonalKanbanLanesService from "../services/PersonalKanbanService/ListPersonalKanbanLanesService";
import UpdatePersonalKanbanLaneService from "../services/PersonalKanbanService/UpdatePersonalKanbanLaneService";
import DeletePersonalKanbanLaneService from "../services/PersonalKanbanService/DeletePersonalKanbanLaneService";
import ReorderPersonalKanbanLanesService from "../services/PersonalKanbanService/ReorderPersonalKanbanLanesService";

import CreatePersonalKanbanItemService from "../services/PersonalKanbanService/CreatePersonalKanbanItemService";
import ShowPersonalKanbanItemService from "../services/PersonalKanbanService/ShowPersonalKanbanItemService";
import UpdatePersonalKanbanItemService from "../services/PersonalKanbanService/UpdatePersonalKanbanItemService";
import DeletePersonalKanbanItemService from "../services/PersonalKanbanService/DeletePersonalKanbanItemService";
import ReorderPersonalKanbanItemsService from "../services/PersonalKanbanService/ReorderPersonalKanbanItemsService";

// Lanes

export const indexLanes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;

  const lanes = await ListPersonalKanbanLanesService(+userId, companyId);

  return res.status(200).json(lanes);
};

export const storeLane = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { name, position } = req.body;

  const lane = await CreatePersonalKanbanLaneService({
    name,
    position,
    userId: +userId,
    companyId
  });

  const io = getIO();
  io.emit("personalKanban", { action: "lane-update", lane });

  return res.status(200).json(lane);
};

export const updateLane = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id } = req.params;

  const lane = await UpdatePersonalKanbanLaneService(id, +userId, companyId, req.body);

  const io = getIO();
  io.emit("personalKanban", { action: "lane-update", lane });

  return res.status(200).json(lane);
};

export const removeLane = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id } = req.params;

  await DeletePersonalKanbanLaneService(id, +userId, companyId);

  const io = getIO();
  io.emit("personalKanban", { action: "lane-delete", laneId: +id });

  return res.status(200).send();
};

export const reorderLanes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { lanes } = req.body;

  const updatedLanes = await ReorderPersonalKanbanLanesService(+userId, companyId, lanes);

  const io = getIO();
  io.emit("personalKanban", { action: "lanes-reorder", lanes: updatedLanes });

  return res.status(200).json(updatedLanes);
};

// Items

export const storeItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { title, description, position, laneId } = req.body;

  const item = await CreatePersonalKanbanItemService({
    title,
    description,
    position,
    laneId,
    companyId
  });

  const io = getIO();
  io.emit("personalKanban", { action: "item-update", item });

  return res.status(200).json(item);
};

export const showItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const item = await ShowPersonalKanbanItemService(id, companyId);

  return res.status(200).json(item);
};

export const updateItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const item = await UpdatePersonalKanbanItemService(id, companyId, req.body);

  const io = getIO();
  io.emit("personalKanban", { action: "item-update", item });

  return res.status(200).json(item);
};

export const removeItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeletePersonalKanbanItemService(id, companyId);

  const io = getIO();
  io.emit("personalKanban", { action: "item-delete", itemId: +id });

  return res.status(200).send();
};

export const reorderItems = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { items } = req.body;

  const updatedItems = await ReorderPersonalKanbanItemsService(companyId, items);

  const io = getIO();
  io.emit("personalKanban", { action: "items-reorder", items: updatedItems });

  return res.status(200).json(updatedItems);
};
