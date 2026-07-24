import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as CampaignController from "../controllers/CampaignController";

const campaignRoutes = Router();

campaignRoutes.get("/campaigns", isAuth, CampaignController.index);

campaignRoutes.post("/campaigns", isAuth, CampaignController.store);

campaignRoutes.get("/campaigns/:campaignId", isAuth, CampaignController.show);

campaignRoutes.put("/campaigns/:campaignId", isAuth, CampaignController.update);

campaignRoutes.delete(
  "/campaigns/:campaignId",
  isAuth,
  CampaignController.remove
);

campaignRoutes.post(
  "/campaigns/:campaignId/start",
  isAuth,
  CampaignController.start
);

campaignRoutes.post(
  "/campaigns/:campaignId/pause",
  isAuth,
  CampaignController.pause
);

campaignRoutes.post(
  "/campaigns/:campaignId/cancel",
  isAuth,
  CampaignController.cancel
);

campaignRoutes.post(
  "/campaigns/:campaignId/duplicate",
  isAuth,
  CampaignController.duplicate
);

campaignRoutes.get(
  "/campaigns/:campaignId/stats",
  isAuth,
  CampaignController.stats
);

campaignRoutes.post(
  "/campaigns/:campaignId/contacts",
  isAuth,
  CampaignController.importContacts
);

export default campaignRoutes;
