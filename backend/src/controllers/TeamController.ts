import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateTeamService from "../services/TeamService/CreateTeamService";
import DeleteTeamService from "../services/TeamService/DeleteTeamService";
import ListTeamsService from "../services/TeamService/ListTeamsService";
import ShowTeamService from "../services/TeamService/ShowTeamService";
import UpdateTeamService from "../services/TeamService/UpdateTeamService";
import AddTeamMemberService from "../services/TeamService/AddTeamMemberService";
import RemoveTeamMemberService from "../services/TeamService/RemoveTeamMemberService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const teams = await ListTeamsService(companyId);

  return res.status(200).json(teams);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, departmentId } = req.body;

  const team = await CreateTeamService({ name, departmentId, companyId });

  const io = getIO();
  io.emit("team", {
    action: "update",
    team
  });

  return res.status(200).json(team);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { teamId } = req.params;

  const team = await ShowTeamService(teamId, companyId);

  return res.status(200).json(team);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { teamId } = req.params;

  const team = await UpdateTeamService(teamId, companyId, req.body);

  const io = getIO();
  io.emit("team", {
    action: "update",
    team
  });

  return res.status(201).json(team);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { teamId } = req.params;

  await DeleteTeamService(teamId, companyId);

  const io = getIO();
  io.emit("team", {
    action: "delete",
    teamId: +teamId
  });

  return res.status(200).send();
};

export const addMember = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { teamId, userId } = req.params;

  await AddTeamMemberService(teamId, userId, companyId);

  const team = await ShowTeamService(teamId, companyId);

  const io = getIO();
  io.emit("team", {
    action: "update",
    team
  });

  return res.status(200).json(team);
};

export const removeMember = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { teamId, userId } = req.params;

  await RemoveTeamMemberService(teamId, userId, companyId);

  const team = await ShowTeamService(teamId, companyId);

  const io = getIO();
  io.emit("team", {
    action: "update",
    team
  });

  return res.status(200).json(team);
};
