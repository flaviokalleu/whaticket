import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as PushController from "../controllers/PushController";

const pushRoutes = Router();

pushRoutes.get("/push/vapid-public-key", PushController.getVapidPublicKey);

pushRoutes.post("/push/subscribe", isAuth, PushController.subscribe);

pushRoutes.post("/push/unsubscribe", isAuth, PushController.unsubscribe);

pushRoutes.post("/push/test", isAuth, PushController.test);

export default pushRoutes;
