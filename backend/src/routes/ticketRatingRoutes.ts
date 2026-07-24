import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TicketRatingController from "../controllers/TicketRatingController";

const ticketRatingRoutes = Router();

ticketRatingRoutes.get(
  "/tickets/:ticketId/rating",
  isAuth,
  TicketRatingController.show
);

ticketRatingRoutes.post(
  "/tickets/:ticketId/rating",
  isAuth,
  TicketRatingController.store
);

export default ticketRatingRoutes;
