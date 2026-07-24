import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as LeadController from "../controllers/LeadController";

const leadRoutes = Router();

leadRoutes.get(
  "/crm/lead-pipelines",
  isAuth,
  LeadController.indexLeadPipelines
);
leadRoutes.post(
  "/crm/lead-pipelines",
  isAuth,
  LeadController.storeLeadPipeline
);

leadRoutes.get("/crm/leads/stats", isAuth, LeadController.stats);
leadRoutes.post(
  "/crm/leads/bulk-update-status",
  isAuth,
  LeadController.bulkUpdateStatus
);

leadRoutes.get("/crm/leads", isAuth, LeadController.index);
leadRoutes.post("/crm/leads", isAuth, LeadController.store);

leadRoutes.get(
  "/crm/leads/:leadId/interactions",
  isAuth,
  LeadController.indexInteractions
);
leadRoutes.post(
  "/crm/leads/:leadId/interactions",
  isAuth,
  LeadController.storeInteraction
);

leadRoutes.get(
  "/crm/leads/:leadId/tasks",
  isAuth,
  LeadController.indexTasks
);
leadRoutes.post(
  "/crm/leads/:leadId/tasks",
  isAuth,
  LeadController.storeTask
);
leadRoutes.put(
  "/crm/leads/:leadId/tasks/:taskId",
  isAuth,
  LeadController.updateTask
);
leadRoutes.post(
  "/crm/leads/:leadId/tasks/:taskId/complete",
  isAuth,
  LeadController.completeTask
);

leadRoutes.get("/crm/leads/:id", isAuth, LeadController.show);
leadRoutes.put("/crm/leads/:id", isAuth, LeadController.update);
leadRoutes.delete("/crm/leads/:id", isAuth, LeadController.remove);

export default leadRoutes;
