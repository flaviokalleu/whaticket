import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreatePipelineService from "../services/PipelineService/CreatePipelineService";
import ListPipelinesService from "../services/PipelineService/ListPipelinesService";
import ShowPipelineService from "../services/PipelineService/ShowPipelineService";
import UpdatePipelineService from "../services/PipelineService/UpdatePipelineService";
import DeletePipelineService from "../services/PipelineService/DeletePipelineService";

import CreatePipelineStageService from "../services/PipelineService/CreatePipelineStageService";
import ListPipelineStagesService from "../services/PipelineService/ListPipelineStagesService";
import ShowPipelineStageService from "../services/PipelineService/ShowPipelineStageService";
import UpdatePipelineStageService from "../services/PipelineService/UpdatePipelineStageService";
import DeletePipelineStageService from "../services/PipelineService/DeletePipelineStageService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const pipelines = await ListPipelinesService(companyId);

  return res.status(200).json(pipelines);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;

  const pipeline = await CreatePipelineService({ name, companyId });

  const io = getIO();
  io.emit("pipeline", {
    action: "update",
    pipeline
  });

  return res.status(200).json(pipeline);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const pipeline = await ShowPipelineService(id, companyId);

  return res.status(200).json(pipeline);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const pipeline = await UpdatePipelineService(id, companyId, req.body);

  const io = getIO();
  io.emit("pipeline", {
    action: "update",
    pipeline
  });

  return res.status(201).json(pipeline);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeletePipelineService(id, companyId);

  const io = getIO();
  io.emit("pipeline", {
    action: "delete",
    pipelineId: +id
  });

  return res.status(200).send();
};

// Stages

export const indexStages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { pipelineId } = req.params;

  const stages = await ListPipelineStagesService(pipelineId, companyId);

  return res.status(200).json(stages);
};

export const storeStage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { pipelineId } = req.params;
  const { name, position, color } = req.body;

  const stage = await CreatePipelineStageService({
    pipelineId,
    companyId,
    name,
    position,
    color
  });

  const io = getIO();
  io.emit("pipeline", {
    action: "update-stage",
    stage
  });

  return res.status(200).json(stage);
};

export const showStage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { stageId } = req.params;

  const stage = await ShowPipelineStageService(stageId, companyId);

  return res.status(200).json(stage);
};

export const updateStage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { stageId } = req.params;

  const stage = await UpdatePipelineStageService(stageId, companyId, req.body);

  const io = getIO();
  io.emit("pipeline", {
    action: "update-stage",
    stage
  });

  return res.status(201).json(stage);
};

export const removeStage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { stageId } = req.params;

  await DeletePipelineStageService(stageId, companyId);

  const io = getIO();
  io.emit("pipeline", {
    action: "delete-stage",
    stageId: +stageId
  });

  return res.status(200).send();
};
