import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TeamController from "../controllers/TeamController";

const teamRoutes = Router();

teamRoutes.get("/teams", isAuth, TeamController.index);

teamRoutes.post("/teams", isAuth, TeamController.store);

teamRoutes.get("/teams/:teamId", isAuth, TeamController.show);

teamRoutes.put("/teams/:teamId", isAuth, TeamController.update);

teamRoutes.delete("/teams/:teamId", isAuth, TeamController.remove);

teamRoutes.post(
  "/teams/:teamId/members/:userId",
  isAuth,
  TeamController.addMember
);

teamRoutes.delete(
  "/teams/:teamId/members/:userId",
  isAuth,
  TeamController.removeMember
);

export default teamRoutes;
