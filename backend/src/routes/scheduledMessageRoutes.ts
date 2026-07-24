import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ScheduledMessageController from "../controllers/ScheduledMessageController";

const scheduledMessageRoutes = Router();

scheduledMessageRoutes.get(
  "/scheduled-messages",
  isAuth,
  ScheduledMessageController.index
);
scheduledMessageRoutes.get(
  "/scheduled-messages/by-contact/:contactId",
  isAuth,
  ScheduledMessageController.listByContact
);
scheduledMessageRoutes.get(
  "/scheduled-messages/:id",
  isAuth,
  ScheduledMessageController.show
);
scheduledMessageRoutes.post(
  "/scheduled-messages",
  isAuth,
  ScheduledMessageController.store
);
scheduledMessageRoutes.put(
  "/scheduled-messages/:id",
  isAuth,
  ScheduledMessageController.update
);
scheduledMessageRoutes.delete(
  "/scheduled-messages/:id",
  isAuth,
  ScheduledMessageController.remove
);
scheduledMessageRoutes.post(
  "/scheduled-messages/:id/cancel",
  isAuth,
  ScheduledMessageController.cancel
);

export default scheduledMessageRoutes;
