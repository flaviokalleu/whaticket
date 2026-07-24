import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SLAController from "../controllers/SLAController";

const slaRoutes = Router();

slaRoutes.get("/sla/stats", isAuth, SLAController.stats);

slaRoutes.get("/sla/at-risk", isAuth, SLAController.atRisk);

slaRoutes.put("/queues/:queueId/sla", isAuth, SLAController.updateQueueSLA);

export default slaRoutes;
