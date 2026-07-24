import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateCampaignService from "../services/CampaignService/CreateCampaignService";
import ListCampaignsService from "../services/CampaignService/ListCampaignsService";
import ShowCampaignService from "../services/CampaignService/ShowCampaignService";
import UpdateCampaignService from "../services/CampaignService/UpdateCampaignService";
import DeleteCampaignService from "../services/CampaignService/DeleteCampaignService";
import StartCampaignService from "../services/CampaignService/StartCampaignService";
import PauseCampaignService from "../services/CampaignService/PauseCampaignService";
import CancelCampaignService from "../services/CampaignService/CancelCampaignService";
import DuplicateCampaignService from "../services/CampaignService/DuplicateCampaignService";
import GetCampaignStatsService from "../services/CampaignService/GetCampaignStatsService";
import ImportCampaignContactsFromCsvService from "../services/CampaignService/ImportCampaignContactsFromCsvService";

export const index = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const campaigns = await ListCampaignsService(companyId);

  return res.status(200).json(campaigns);
};

export const store = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id } = req.user;

  const campaign = await CreateCampaignService({
    companyId,
    createdBy: +id,
    campaignData: req.body
  });

  const io = getIO();
  io.emit("campaign", {
    action: "create",
    campaign
  });

  return res.status(200).json(campaign);
};

export const show = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  const campaign = await ShowCampaignService(campaignId, companyId);

  return res.status(200).json(campaign);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  const campaign = await UpdateCampaignService(campaignId, companyId, req.body);

  const io = getIO();
  io.emit("campaign", {
    action: "update",
    campaign
  });

  return res.status(200).json(campaign);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  await DeleteCampaignService(campaignId, companyId);

  const io = getIO();
  io.emit("campaign", {
    action: "delete",
    campaignId: +campaignId
  });

  return res.status(200).send();
};

export const start = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  const campaign = await StartCampaignService(campaignId, companyId);

  const io = getIO();
  io.emit("campaign", {
    action: "update",
    campaign
  });

  return res.status(200).json(campaign);
};

export const pause = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  const campaign = await PauseCampaignService(campaignId, companyId);

  const io = getIO();
  io.emit("campaign", {
    action: "update",
    campaign
  });

  return res.status(200).json(campaign);
};

export const cancel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  const campaign = await CancelCampaignService(campaignId, companyId);

  const io = getIO();
  io.emit("campaign", {
    action: "update",
    campaign
  });

  return res.status(200).json(campaign);
};

export const duplicate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id } = req.user;
  const { campaignId } = req.params;

  const campaign = await DuplicateCampaignService(campaignId, companyId, +id);

  const io = getIO();
  io.emit("campaign", {
    action: "create",
    campaign
  });

  return res.status(200).json(campaign);
};

export const stats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;

  const campaignStats = await GetCampaignStatsService(campaignId, companyId);

  return res.status(200).json(campaignStats);
};

export const importContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { campaignId } = req.params;
  const { contacts } = req.body;

  const result = await ImportCampaignContactsFromCsvService(
    campaignId,
    companyId,
    contacts || []
  );

  const io = getIO();
  io.emit("campaign", {
    action: "contactsImported",
    campaignId: +campaignId
  });

  return res.status(200).json(result);
};
