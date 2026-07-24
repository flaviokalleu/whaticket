import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as BoardController from "../controllers/BoardController";

const boardRoutes = Router();

boardRoutes.get("/boards", isAuth, BoardController.index);
boardRoutes.post("/boards", isAuth, BoardController.store);
boardRoutes.get("/boards/:id", isAuth, BoardController.show);
boardRoutes.put("/boards/:id", isAuth, BoardController.update);
boardRoutes.delete("/boards/:id", isAuth, BoardController.remove);

boardRoutes.post("/boards/:id/lanes", isAuth, BoardController.storeLane);
boardRoutes.put("/boards/:id/lanes/:laneId", isAuth, BoardController.updateLane);
boardRoutes.delete("/boards/:id/lanes/:laneId", isAuth, BoardController.removeLane);
boardRoutes.post("/boards/:id/lanes/reorder", isAuth, BoardController.reorderLanes);

boardRoutes.post("/boards/:id/tasks", isAuth, BoardController.storeTask);
boardRoutes.get("/boards/:id/tasks", isAuth, BoardController.indexTasks);
boardRoutes.put("/boards/:id/tasks/:taskId", isAuth, BoardController.updateTask);
boardRoutes.delete("/boards/:id/tasks/:taskId", isAuth, BoardController.removeTask);
boardRoutes.get("/boards/:id/tasks/:taskId", isAuth, BoardController.showTask);
boardRoutes.put("/boards/:id/tasks/:taskId/move", isAuth, BoardController.moveTask);

boardRoutes.get("/boards/tasks/:taskId/tags", isAuth, BoardController.indexTaskTags);
boardRoutes.post("/boards/tasks/:taskId/tags", isAuth, BoardController.storeTaskTag);
boardRoutes.delete("/boards/tasks/:taskId/tags/:tagId", isAuth, BoardController.removeTaskTag);

boardRoutes.get("/boards/tasks/:taskId/checklist", isAuth, BoardController.indexChecklistItems);
boardRoutes.post("/boards/tasks/:taskId/checklist", isAuth, BoardController.storeChecklistItem);
boardRoutes.put("/boards/tasks/:taskId/checklist/:itemId", isAuth, BoardController.updateChecklistItem);
boardRoutes.delete("/boards/tasks/:taskId/checklist/:itemId", isAuth, BoardController.removeChecklistItem);

export default boardRoutes;
