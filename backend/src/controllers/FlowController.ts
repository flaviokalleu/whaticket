import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Flow from "../models/Flow";

import CreateFlowService from "../services/FlowService/CreateFlowService";
import ListFlowsService from "../services/FlowService/ListFlowsService";
import ShowFlowService from "../services/FlowService/ShowFlowService";
import UpdateFlowService from "../services/FlowService/UpdateFlowService";
import DeleteFlowService from "../services/FlowService/DeleteFlowService";
import ListFlowExecutionsService from "../services/FlowService/ListFlowExecutionsService";
import EnqueueFlowExecutionService from "../services/FlowService/EnqueueFlowExecutionService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const flows = await ListFlowsService(companyId);

  return res.status(200).json(flows);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, nodes, edges, isActive } = req.body;

  const flow = await CreateFlowService({
    name,
    nodes,
    edges,
    isActive,
    companyId
  });

  const io = getIO();
  io.emit("flow", { action: "update", flow });

  return res.status(200).json(flow);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  const flow = await ShowFlowService(flowId, companyId);

  return res.status(200).json(flow);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  const flow = await UpdateFlowService({
    flowData: req.body,
    flowId,
    companyId
  });

  const io = getIO();
  io.emit("flow", { action: "update", flow });

  return res.status(200).json(flow);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  await DeleteFlowService(flowId, companyId);

  const io = getIO();
  io.emit("flow", { action: "delete", flowId: +flowId });

  return res.status(200).send();
};

export const execute = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;
  const { input } = req.body;

  const flow = await ShowFlowService(flowId, companyId);

  const execution = await EnqueueFlowExecutionService({
    flow,
    input: input || null
  });

  return res.status(200).json({ executionId: execution.id });
};

export const executions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  const list = await ListFlowExecutionsService(flowId, companyId);

  return res.status(200).json(list);
};

// Public endpoint: triggered by an external system posting to the flow's
// webhook token. Not behind isAuth, so it resolves the tenant from the token.
export const webhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { webhookToken } = req.params;

  const flow = await Flow.findOne({ where: { webhookToken, isActive: true } });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  const execution = await EnqueueFlowExecutionService({
    flow,
    input: req.body || {}
  });

  return res.status(200).json({ executionId: execution.id });
};
