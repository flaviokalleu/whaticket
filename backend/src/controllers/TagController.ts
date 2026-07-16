import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import CreateTagService from "../services/TagService/CreateTagService";
import DeleteTagService from "../services/TagService/DeleteTagService";
import ListTagsService from "../services/TagService/ListTagsService";
import ShowTagService from "../services/TagService/ShowTagService";
import UpdateTagService from "../services/TagService/UpdateTagService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const tags = await ListTagsService();

  return res.status(200).json(tags);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { name, color } = req.body;

  const tag = await CreateTagService({ name, color });

  const io = getIO();
  io.emit("tag", {
    action: "update",
    tag
  });

  return res.status(200).json(tag);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  const tag = await ShowTagService(tagId);

  return res.status(200).json(tag);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tagId } = req.params;

  const tag = await UpdateTagService(tagId, req.body);

  const io = getIO();
  io.emit("tag", {
    action: "update",
    tag
  });

  return res.status(201).json(tag);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tagId } = req.params;

  await DeleteTagService(tagId);

  const io = getIO();
  io.emit("tag", {
    action: "delete",
    tagId: +tagId
  });

  return res.status(200).send();
};
