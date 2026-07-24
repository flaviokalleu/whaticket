import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as PersonalKanbanController from "../controllers/PersonalKanbanController";

const personalKanbanRoutes = Router();

personalKanbanRoutes.get(
  "/personal-kanban/lanes",
  isAuth,
  PersonalKanbanController.indexLanes
);
personalKanbanRoutes.post(
  "/personal-kanban/lanes",
  isAuth,
  PersonalKanbanController.storeLane
);
personalKanbanRoutes.put(
  "/personal-kanban/lanes/:id",
  isAuth,
  PersonalKanbanController.updateLane
);
personalKanbanRoutes.delete(
  "/personal-kanban/lanes/:id",
  isAuth,
  PersonalKanbanController.removeLane
);
personalKanbanRoutes.post(
  "/personal-kanban/lanes/reorder",
  isAuth,
  PersonalKanbanController.reorderLanes
);

personalKanbanRoutes.get(
  "/personal-kanban/items/:id",
  isAuth,
  PersonalKanbanController.showItem
);
personalKanbanRoutes.post(
  "/personal-kanban/items",
  isAuth,
  PersonalKanbanController.storeItem
);
personalKanbanRoutes.put(
  "/personal-kanban/items/:id",
  isAuth,
  PersonalKanbanController.updateItem
);
personalKanbanRoutes.delete(
  "/personal-kanban/items/:id",
  isAuth,
  PersonalKanbanController.removeItem
);
personalKanbanRoutes.post(
  "/personal-kanban/items/reorder",
  isAuth,
  PersonalKanbanController.reorderItems
);

export default personalKanbanRoutes;
