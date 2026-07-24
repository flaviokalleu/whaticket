import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as PipelineController from "../controllers/PipelineController";

const pipelineRoutes = Router();

pipelineRoutes.get("/crm/pipelines", isAuth, PipelineController.index);
pipelineRoutes.post("/crm/pipelines", isAuth, PipelineController.store);
pipelineRoutes.get("/crm/pipelines/:id", isAuth, PipelineController.show);
pipelineRoutes.put("/crm/pipelines/:id", isAuth, PipelineController.update);
pipelineRoutes.delete("/crm/pipelines/:id", isAuth, PipelineController.remove);

pipelineRoutes.get(
  "/crm/pipelines/:pipelineId/stages",
  isAuth,
  PipelineController.indexStages
);
pipelineRoutes.post(
  "/crm/pipelines/:pipelineId/stages",
  isAuth,
  PipelineController.storeStage
);
pipelineRoutes.get(
  "/crm/pipelines/:pipelineId/stages/:stageId",
  isAuth,
  PipelineController.showStage
);
pipelineRoutes.put(
  "/crm/pipelines/:pipelineId/stages/:stageId",
  isAuth,
  PipelineController.updateStage
);
pipelineRoutes.delete(
  "/crm/pipelines/:pipelineId/stages/:stageId",
  isAuth,
  PipelineController.removeStage
);

export default pipelineRoutes;
