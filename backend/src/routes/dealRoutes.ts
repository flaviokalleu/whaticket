import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as DealController from "../controllers/DealController";

const dealRoutes = Router();

dealRoutes.get("/crm/deals", isAuth, DealController.index);
dealRoutes.post("/crm/deals", isAuth, DealController.store);
dealRoutes.get("/crm/deals/:id", isAuth, DealController.show);
dealRoutes.put("/crm/deals/:id", isAuth, DealController.update);
dealRoutes.delete("/crm/deals/:id", isAuth, DealController.remove);

dealRoutes.post("/crm/deals/:id/move", isAuth, DealController.move);

dealRoutes.get("/crm/deals/:id/notes", isAuth, DealController.indexNotes);
dealRoutes.post("/crm/deals/:id/notes", isAuth, DealController.storeNote);

export default dealRoutes;
