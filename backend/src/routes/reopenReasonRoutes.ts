import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as ReopenReasonController from "../controllers/ReopenReasonController";

const reopenReasonRoutes = Router();

reopenReasonRoutes.get(
  "/reopen-reasons",
  isAuth,
  ReopenReasonController.index
);

reopenReasonRoutes.post(
  "/reopen-reasons",
  isAuth,
  ReopenReasonController.store
);

reopenReasonRoutes.get(
  "/reopen-reasons/:id",
  isAuth,
  ReopenReasonController.show
);

reopenReasonRoutes.put(
  "/reopen-reasons/:id",
  isAuth,
  ReopenReasonController.update
);

reopenReasonRoutes.delete(
  "/reopen-reasons/:id",
  isAuth,
  ReopenReasonController.remove
);

export default reopenReasonRoutes;
