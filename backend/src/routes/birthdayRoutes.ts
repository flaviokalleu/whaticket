import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as BirthdayController from "../controllers/BirthdayController";

const birthdayRoutes = Router();

birthdayRoutes.get(
  "/birthdays/settings",
  isAuth,
  BirthdayController.getSettings
);

birthdayRoutes.put(
  "/birthdays/settings",
  isAuth,
  BirthdayController.updateSettings
);

birthdayRoutes.get("/birthdays/upcoming", isAuth, BirthdayController.upcoming);

birthdayRoutes.get("/birthdays/today", isAuth, BirthdayController.today);

export default birthdayRoutes;
