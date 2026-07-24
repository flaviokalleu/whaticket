import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as MessageTemplateController from "../controllers/MessageTemplateController";

const messageTemplateRoutes = Router();

messageTemplateRoutes.get("/templates", isAuth, MessageTemplateController.index);
messageTemplateRoutes.get(
  "/templates/:id",
  isAuth,
  MessageTemplateController.show
);
messageTemplateRoutes.post(
  "/templates",
  isAuth,
  MessageTemplateController.store
);
messageTemplateRoutes.put(
  "/templates/:id",
  isAuth,
  MessageTemplateController.update
);
messageTemplateRoutes.delete(
  "/templates/:id",
  isAuth,
  MessageTemplateController.remove
);

export default messageTemplateRoutes;
