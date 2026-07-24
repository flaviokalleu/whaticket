import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as WebhookController from "../controllers/WebhookController";

const webhookRoutes = Router();

webhookRoutes.get("/webhooks", isAuth, WebhookController.index);

webhookRoutes.post("/webhooks", isAuth, WebhookController.store);

webhookRoutes.get("/webhooks/:id", isAuth, WebhookController.show);

webhookRoutes.put("/webhooks/:id", isAuth, WebhookController.update);

webhookRoutes.delete("/webhooks/:id", isAuth, WebhookController.remove);

webhookRoutes.get("/webhooks/:id/logs", isAuth, WebhookController.logs);

export default webhookRoutes;
