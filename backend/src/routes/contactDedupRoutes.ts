import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as ContactDedupController from "../controllers/ContactDedupController";

const contactDedupRoutes = Router();

contactDedupRoutes.get(
  "/contacts/dedup/find",
  isAuth,
  ContactDedupController.find
);

contactDedupRoutes.post(
  "/contacts/dedup/merge",
  isAuth,
  ContactDedupController.merge
);

export default contactDedupRoutes;
