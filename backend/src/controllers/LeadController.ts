import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateLeadPipelineService from "../services/LeadService/CreateLeadPipelineService";
import ListLeadPipelinesService from "../services/LeadService/ListLeadPipelinesService";

import CreateLeadService from "../services/LeadService/CreateLeadService";
import ListLeadsService from "../services/LeadService/ListLeadsService";
import ShowLeadService from "../services/LeadService/ShowLeadService";
import UpdateLeadService from "../services/LeadService/UpdateLeadService";
import DeleteLeadService from "../services/LeadService/DeleteLeadService";
import GetLeadStatsService from "../services/LeadService/GetLeadStatsService";
import BulkUpdateLeadStatusService from "../services/LeadService/BulkUpdateLeadStatusService";

import CreateLeadInteractionService from "../services/LeadService/CreateLeadInteractionService";
import ListLeadInteractionsService from "../services/LeadService/ListLeadInteractionsService";

import CreateLeadTaskService from "../services/LeadService/CreateLeadTaskService";
import ListLeadTasksService from "../services/LeadService/ListLeadTasksService";
import UpdateLeadTaskService from "../services/LeadService/UpdateLeadTaskService";
import CompleteLeadTaskService from "../services/LeadService/CompleteLeadTaskService";

// Lead pipelines

export const indexLeadPipelines = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const leadPipelines = await ListLeadPipelinesService(companyId);

  return res.status(200).json(leadPipelines);
};

export const storeLeadPipeline = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;

  const leadPipeline = await CreateLeadPipelineService({ name, companyId });

  const io = getIO();
  io.emit("lead", {
    action: "update-pipeline",
    leadPipeline
  });

  return res.status(200).json(leadPipeline);
};

// Leads

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { leadPipelineId, status, userId } = req.query;

  const leads = await ListLeadsService({
    companyId,
    leadPipelineId: leadPipelineId as string,
    status: status as string,
    userId: userId as string
  });

  return res.status(200).json(leads);
};

export const stats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const leadStats = await GetLeadStatsService(companyId);

  return res.status(200).json(leadStats);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { leadPipelineId, name, phone, email, source, status, userId } =
    req.body;

  const lead = await CreateLeadService({
    leadPipelineId,
    name,
    phone,
    email,
    source,
    status,
    userId,
    companyId
  });

  const io = getIO();
  io.emit("lead", {
    action: "update",
    lead
  });

  return res.status(200).json(lead);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const lead = await ShowLeadService(id, companyId);

  return res.status(200).json(lead);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const lead = await UpdateLeadService(id, companyId, req.body);

  const io = getIO();
  io.emit("lead", {
    action: "update",
    lead
  });

  return res.status(201).json(lead);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteLeadService(id, companyId);

  const io = getIO();
  io.emit("lead", {
    action: "delete",
    leadId: +id
  });

  return res.status(200).send();
};

export const bulkUpdateStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { leadIds, status } = req.body;

  const affectedCount = await BulkUpdateLeadStatusService({
    companyId,
    leadIds,
    status
  });

  const io = getIO();
  io.emit("lead", {
    action: "bulk-update-status",
    leadIds,
    status
  });

  return res.status(200).json({ affectedCount });
};

// Interactions

export const indexInteractions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { leadId } = req.params;

  const interactions = await ListLeadInteractionsService(leadId, companyId);

  return res.status(200).json(interactions);
};

export const storeInteraction = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { leadId } = req.params;
  const { type, body } = req.body;

  const interaction = await CreateLeadInteractionService({
    leadId,
    userId: +userId,
    companyId,
    type,
    body
  });

  const io = getIO();
  io.emit("lead", {
    action: "update-interaction",
    interaction
  });

  return res.status(200).json(interaction);
};

// Tasks

export const indexTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { leadId } = req.params;

  const tasks = await ListLeadTasksService(leadId, companyId);

  return res.status(200).json(tasks);
};

export const storeTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { leadId } = req.params;
  const { title, dueDate, userId: assigneeId } = req.body;

  const task = await CreateLeadTaskService({
    leadId,
    userId: assigneeId ?? +userId,
    companyId,
    title,
    dueDate
  });

  const io = getIO();
  io.emit("lead", {
    action: "update-task",
    task
  });

  return res.status(200).json(task);
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const task = await UpdateLeadTaskService(taskId, companyId, req.body);

  const io = getIO();
  io.emit("lead", {
    action: "update-task",
    task
  });

  return res.status(201).json(task);
};

export const completeTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { taskId } = req.params;

  const task = await CompleteLeadTaskService(taskId, companyId);

  const io = getIO();
  io.emit("lead", {
    action: "update-task",
    task
  });

  return res.status(200).json(task);
};
