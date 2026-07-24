import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as WhiteLabelController from "../controllers/WhiteLabelController";

const whiteLabelRoutes = Router();

const upload = multer(uploadConfig);

whiteLabelRoutes.get(
  "/settings/white-label",
  isAuth,
  WhiteLabelController.show
);

whiteLabelRoutes.put(
  "/settings/white-label",
  isAuth,
  WhiteLabelController.update
);

whiteLabelRoutes.post(
  "/settings/white-label/logo",
  isAuth,
  upload.single("file"),
  WhiteLabelController.uploadLogo
);

whiteLabelRoutes.post(
  "/settings/white-label/background",
  isAuth,
  upload.single("file"),
  WhiteLabelController.uploadBackground
);

export default whiteLabelRoutes;
