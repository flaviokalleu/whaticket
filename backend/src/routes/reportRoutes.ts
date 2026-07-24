import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as ReportController from "../controllers/ReportController";

const reportRoutes = Router();

reportRoutes.get("/reports/tickets", isAuth, ReportController.tickets);

export default reportRoutes;
