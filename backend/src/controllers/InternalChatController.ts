import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateGroupService from "../services/InternalChatService/CreateGroupService";
import ShowGroupService from "../services/InternalChatService/ShowGroupService";
import UpdateGroupService from "../services/InternalChatService/UpdateGroupService";
import DeleteGroupService from "../services/InternalChatService/DeleteGroupService";
import ListGroupsService from "../services/InternalChatService/ListGroupsService";
import AddGroupMemberService from "../services/InternalChatService/AddGroupMemberService";
import RemoveGroupMemberService from "../services/InternalChatService/RemoveGroupMemberService";
import SendGroupMessageService from "../services/InternalChatService/SendGroupMessageService";
import SendDirectMessageService from "../services/InternalChatService/SendDirectMessageService";
import ListGroupMessagesService from "../services/InternalChatService/ListGroupMessagesService";
import ListDirectMessagesService from "../services/InternalChatService/ListDirectMessagesService";
import ListConversationsService from "../services/InternalChatService/ListConversationsService";
import MarkAsReadService from "../services/InternalChatService/MarkAsReadService";

export const indexGroups = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;

  const groups = await ListGroupsService(+userId, companyId);

  return res.status(200).json(groups);
};

export const storeGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { name, memberIds } = req.body;

  const group = await CreateGroupService({
    name,
    createdBy: +userId,
    companyId,
    memberIds
  });

  const io = getIO();
  io.emit("internalChat:group", { action: "create", group });

  return res.status(200).json(group);
};

export const showGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const group = await ShowGroupService(id, companyId);

  return res.status(200).json(group);
};

export const updateGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { name } = req.body;

  const group = await UpdateGroupService({ groupId: id, companyId, name });

  const io = getIO();
  io.emit("internalChat:group", { action: "update", group });

  return res.status(200).json(group);
};

export const removeGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteGroupService(id, companyId);

  const io = getIO();
  io.emit("internalChat:group", { action: "delete", groupId: +id });

  return res.status(200).send();
};

export const addMember = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { userId } = req.body;

  const member = await AddGroupMemberService({
    groupId: id,
    userId,
    companyId
  });

  const io = getIO();
  io.emit("internalChat:group", { action: "memberAdded", groupId: +id, member });

  return res.status(200).json(member);
};

export const removeMember = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id, userId } = req.params;

  await RemoveGroupMemberService({ groupId: id, userId, companyId });

  const io = getIO();
  io.emit("internalChat:group", {
    action: "memberRemoved",
    groupId: +id,
    userId: +userId
  });

  return res.status(200).send();
};

export const sendGroupMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id } = req.params;
  const { body } = req.body;

  const message = await SendGroupMessageService({
    groupId: id,
    fromUserId: +userId,
    companyId,
    body
  });

  const io = getIO();
  io.emit("internalChat:message", { message });

  return res.status(200).json(message);
};

export const sendDirectMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { userId: toUserId } = req.params;
  const { body } = req.body;

  const message = await SendDirectMessageService({
    fromUserId: +userId,
    toUserId,
    companyId,
    body
  });

  const io = getIO();
  io.emit("internalChat:message", { message });

  return res.status(200).json(message);
};

export const listGroupMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { id } = req.params;
  const { pageNumber, pageSize } = req.query;

  const result = await ListGroupMessagesService({
    groupId: id,
    userId: +userId,
    companyId,
    pageNumber: pageNumber ? +pageNumber : undefined,
    pageSize: pageSize ? +pageSize : undefined
  });

  return res.status(200).json(result);
};

export const listDirectMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { userId: otherUserId } = req.params;
  const { pageNumber, pageSize } = req.query;

  const result = await ListDirectMessagesService({
    userId: +userId,
    otherUserId,
    companyId,
    pageNumber: pageNumber ? +pageNumber : undefined,
    pageSize: pageSize ? +pageSize : undefined
  });

  return res.status(200).json(result);
};

export const listConversations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;

  const conversations = await ListConversationsService(+userId, companyId);

  return res.status(200).json(conversations);
};

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId } = req.user;
  const { id } = req.params;
  const { type } = req.query;

  const record = await MarkAsReadService({
    userId: +userId,
    groupId: type === "group" ? id : null,
    otherUserId: type === "direct" ? id : null
  });

  const io = getIO();
  io.emit("internalChat:read", { userId: +userId, type, id: +id });

  return res.status(200).json(record);
};
