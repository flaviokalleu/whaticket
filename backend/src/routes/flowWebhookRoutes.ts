import { Router } from "express";

import * as FlowController from "../controllers/FlowController";

// Public (unauthenticated) inbound webhook that triggers a flow by its token.
const flowWebhookRoutes = Router();

flowWebhookRoutes.post("/flow-webhooks/:webhookToken", FlowController.webhook);

export default flowWebhookRoutes;
