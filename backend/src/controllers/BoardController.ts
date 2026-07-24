import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateBoardService from "../services/BoardService/CreateBoardService";
import ListBoardsService from "../services/BoardService/ListBoardsService";
import ShowBoardService from "../services/BoardService/ShowBoardService";
import UpdateBoardService from "../services/BoardService/UpdateBoardService";
import DeleteBoardService from "../services/BoardService/DeleteBoardService";

import CreateBoardLaneService from "../services/BoardService/CreateBoardLaneService";
import UpdateBoardLaneService from "../services/BoardService/UpdateBoardLaneService";
import DeleteBoardLaneService from "../services/BoardService/DeleteBoardLaneService";
import ReorderBoardLanesService from "../services/BoardService/ReorderBoardLanesService";

import CreateBoardTaskService from "../services/BoardService/CreateBoardTaskService";
import ListBoardTasksService from "../services/BoardService/ListBoardTasksService";
import ShowBoardTaskService from "../services/BoardService/ShowBoardTaskService";
import UpdateBoardTaskService from "../services/BoardService/UpdateBoardTaskService";
import DeleteBoardTaskService from "../services/BoardService/DeleteBoardTaskService";
import MoveBoardTaskService from "../services/BoardService/MoveBoardTaskService";

import CreateBoardTaskTagService from "../services/BoardService/CreateBoardTaskTagService";
import ListBoardTaskTagsService from "../services/BoardService/ListBoardTaskTagsService";
import DeleteBoardTaskTagService from "../services/BoardService/DeleteBoardTaskTagService";

import CreateBoardTaskChecklistItemService from "../services/BoardService/CreateBoardTaskChecklistItemService";
import ListBoardTaskChecklistItemsService from "../services/BoardService/ListBoardTaskChecklistItemsService";
import UpdateBoardTaskChecklistItemService from "../services/BoardService/UpdateBoardTaskChecklistItemService";
import DeleteBoardTaskChecklistItemService from "../services/BoardService/DeleteBoardTaskChecklistItemService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const boards = await ListBoardsService(companyId);

  return res.status(200).json(boards);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { name } = req.body;

  const board = await CreateBoardService({
    name,
    createdBy: +userId,
    companyId
  });

  const io = getIO();
  io.emit("board", { action: "update", board });

  return res.status(200).json(board);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const board = await ShowBoardService(id, companyId);

  return res.status(200).json(board);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const board = await UpdateBoardService(id, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "update", board });

  return res.status(200).json(board);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteBoardService(id, companyId);

  const io = getIO();
  io.emit("board", { action: "delete", boardId: +id });

  return res.status(200).send();
};

// Lanes

export const storeLane = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const lane = await CreateBoardLaneService(id, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "lane-update", lane });

  return res.status(200).json(lane);
};

export const updateLane = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id, laneId } = req.params;

  const lane = await UpdateBoardLaneService(id, laneId, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "lane-update", lane });

  return res.status(200).json(lane);
};

export const removeLane = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id, laneId } = req.params;

  await DeleteBoardLaneService(id, laneId, companyId);

  const io = getIO();
  io.emit("board", { action: "lane-delete", laneId: +laneId });

  return res.status(200).send();
};

export const reorderLanes = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { lanes } = req.body;

  const updatedLanes = await ReorderBoardLanesService(id, companyId, lanes);

  const io = getIO();
  io.emit("board", { action: "lanes-reorder", lanes: updatedLanes });

  return res.status(200).json(updatedLanes);
};

// Tasks

export const storeTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { laneId } = req.body;

  const task = await CreateBoardTaskService(laneId, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "task-update", task });

  return res.status(200).json(task);
};

export const indexTasks = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { laneId } = req.query;

  const tasks = await ListBoardTasksService(laneId as string, companyId);

  return res.status(200).json(tasks);
};

export const showTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const task = await ShowBoardTaskService(taskId, companyId);

  return res.status(200).json(task);
};

export const updateTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const task = await UpdateBoardTaskService(taskId, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "task-update", task });

  return res.status(200).json(task);
};

export const removeTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  await DeleteBoardTaskService(taskId, companyId);

  const io = getIO();
  io.emit("board", { action: "task-delete", taskId: +taskId });

  return res.status(200).send();
};

export const moveTask = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;
  const { laneId, newPosition } = req.body;

  const task = await MoveBoardTaskService({
    taskId,
    laneId,
    newPosition,
    companyId
  });

  const io = getIO();
  io.emit("board", { action: "task-move", task });

  return res.status(200).json(task);
};

// Task tags

export const storeTaskTag = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const tag = await CreateBoardTaskTagService(taskId, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "task-tag-update", tag });

  return res.status(200).json(tag);
};

export const indexTaskTags = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const tags = await ListBoardTaskTagsService(taskId, companyId);

  return res.status(200).json(tags);
};

export const removeTaskTag = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId, tagId } = req.params;

  await DeleteBoardTaskTagService(taskId, tagId, companyId);

  const io = getIO();
  io.emit("board", { action: "task-tag-delete", tagId: +tagId });

  return res.status(200).send();
};

// Checklist items

export const storeChecklistItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const item = await CreateBoardTaskChecklistItemService(taskId, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "checklist-item-update", item });

  return res.status(200).json(item);
};

export const indexChecklistItems = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const items = await ListBoardTaskChecklistItemsService(taskId, companyId);

  return res.status(200).json(items);
};

export const updateChecklistItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId, itemId } = req.params;

  const item = await UpdateBoardTaskChecklistItemService(taskId, itemId, companyId, req.body);

  const io = getIO();
  io.emit("board", { action: "checklist-item-update", item });

  return res.status(200).json(item);
};

export const removeChecklistItem = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId, itemId } = req.params;

  await DeleteBoardTaskChecklistItemService(taskId, itemId, companyId);

  const io = getIO();
  io.emit("board", { action: "checklist-item-delete", itemId: +itemId });

  return res.status(200).send();
};
