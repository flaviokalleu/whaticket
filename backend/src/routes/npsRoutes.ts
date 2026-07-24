import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as NPSController from "../controllers/NPSController";

const npsRoutes = Router();

npsRoutes.post("/nps", isAuth, NPSController.store);

npsRoutes.get("/nps/stats", isAuth, NPSController.stats);

export default npsRoutes;
