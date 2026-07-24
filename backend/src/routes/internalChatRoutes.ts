import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as InternalChatController from "../controllers/InternalChatController";

const internalChatRoutes = Router();

internalChatRoutes.get(
  "/internal-chat/groups",
  isAuth,
  InternalChatController.indexGroups
);
internalChatRoutes.post(
  "/internal-chat/groups",
  isAuth,
  InternalChatController.storeGroup
);
internalChatRoutes.get(
  "/internal-chat/groups/:id",
  isAuth,
  InternalChatController.showGroup
);
internalChatRoutes.put(
  "/internal-chat/groups/:id",
  isAuth,
  InternalChatController.updateGroup
);
internalChatRoutes.delete(
  "/internal-chat/groups/:id",
  isAuth,
  InternalChatController.removeGroup
);

internalChatRoutes.post(
  "/internal-chat/groups/:id/members",
  isAuth,
  InternalChatController.addMember
);
internalChatRoutes.delete(
  "/internal-chat/groups/:id/members/:userId",
  isAuth,
  InternalChatController.removeMember
);

internalChatRoutes.post(
  "/internal-chat/groups/:id/messages",
  isAuth,
  InternalChatController.sendGroupMessage
);
internalChatRoutes.get(
  "/internal-chat/groups/:id/messages",
  isAuth,
  InternalChatController.listGroupMessages
);

internalChatRoutes.post(
  "/internal-chat/direct/:userId/messages",
  isAuth,
  InternalChatController.sendDirectMessage
);
internalChatRoutes.get(
  "/internal-chat/direct/:userId/messages",
  isAuth,
  InternalChatController.listDirectMessages
);

internalChatRoutes.get(
  "/internal-chat/conversations",
  isAuth,
  InternalChatController.listConversations
);

internalChatRoutes.post(
  "/internal-chat/:id/read",
  isAuth,
  InternalChatController.markAsRead
);

export default internalChatRoutes;
