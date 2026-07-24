import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as ContactLGPDController from "../controllers/ContactLGPDController";

const contactLGPDRoutes = Router();

contactLGPDRoutes.get(
  "/contacts/:contactId/lgpd/export",
  isAuth,
  ContactLGPDController.exportData
);

contactLGPDRoutes.delete(
  "/contacts/:contactId/lgpd/anonymize",
  isAuth,
  ContactLGPDController.anonymize
);

export default contactLGPDRoutes;
