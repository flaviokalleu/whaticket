import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as MediaLibraryController from "../controllers/MediaLibraryController";

const upload = multer(uploadConfig);

const mediaLibraryRoutes = Router();

mediaLibraryRoutes.get("/media-library", isAuth, MediaLibraryController.index);
mediaLibraryRoutes.post(
  "/media-library",
  isAuth,
  upload.array("medias"),
  MediaLibraryController.store
);
mediaLibraryRoutes.delete(
  "/media-library/:id",
  isAuth,
  MediaLibraryController.remove
);
mediaLibraryRoutes.post(
  "/media-library/:id/send",
  isAuth,
  MediaLibraryController.send
);

export default mediaLibraryRoutes;
