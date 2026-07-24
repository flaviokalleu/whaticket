import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateTicketLaneService from "../services/TicketLaneService/CreateTicketLaneService";
import ListTicketLanesService from "../services/TicketLaneService/ListTicketLanesService";
import ShowTicketLaneService from "../services/TicketLaneService/ShowTicketLaneService";
import UpdateTicketLaneService from "../services/TicketLaneService/UpdateTicketLaneService";
import DeleteTicketLaneService from "../services/TicketLaneService/DeleteTicketLaneService";
import ReorderTicketLanesService from "../services/TicketLaneService/ReorderTicketLanesService";
import MoveTicketToLaneService from "../services/TicketLaneService/MoveTicketToLaneService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const lanes = await ListTicketLanesService(companyId);

  return res.status(200).json(lanes);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, color, position } = req.body;

  const lane = await CreateTicketLaneService({ name, color, position, companyId });

  const io = getIO();
  io.emit("ticketLane", { action: "update", lane });

  return res.status(200).json(lane);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const lane = await ShowTicketLaneService(id, companyId);

  return res.status(200).json(lane);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const lane = await UpdateTicketLaneService(id, companyId, req.body);

  const io = getIO();
  io.emit("ticketLane", { action: "update", lane });

  return res.status(200).json(lane);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteTicketLaneService(id, companyId);

  const io = getIO();
  io.emit("ticketLane", { action: "delete", laneId: +id });

  return res.status(200).send();
};

export const reorder = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { lanes } = req.body;

  const updatedLanes = await ReorderTicketLanesService(companyId, lanes);

  const io = getIO();
  io.emit("ticketLane", { action: "reorder", lanes: updatedLanes });

  return res.status(200).json(updatedLanes);
};

export const moveTicket = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { ticketId } = req.params;
  const { ticketLaneId } = req.body;

  const ticket = await MoveTicketToLaneService({
    ticketId,
    ticketLaneId,
    companyId
  });

  const io = getIO();
  io.emit("ticketLane", { action: "ticket-move", ticket });

  return res.status(200).json(ticket);
};
