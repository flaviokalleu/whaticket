import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TwoFactorController from "../controllers/TwoFactorController";

const twoFactorRoutes = Router();

twoFactorRoutes.get("/auth/2fa/setup", isAuth, TwoFactorController.setup);

twoFactorRoutes.post("/auth/2fa/enable", isAuth, TwoFactorController.enable);

twoFactorRoutes.delete(
  "/auth/2fa/disable",
  isAuth,
  TwoFactorController.disable
);

export default twoFactorRoutes;
