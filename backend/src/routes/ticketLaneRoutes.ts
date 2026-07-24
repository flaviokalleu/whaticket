import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TicketLaneController from "../controllers/TicketLaneController";

const ticketLaneRoutes = Router();

ticketLaneRoutes.get("/ticket-lanes", isAuth, TicketLaneController.index);
ticketLaneRoutes.post("/ticket-lanes", isAuth, TicketLaneController.store);
ticketLaneRoutes.put("/ticket-lanes/:id", isAuth, TicketLaneController.update);
ticketLaneRoutes.delete("/ticket-lanes/:id", isAuth, TicketLaneController.remove);
ticketLaneRoutes.post("/ticket-lanes/reorder", isAuth, TicketLaneController.reorder);
ticketLaneRoutes.patch(
  "/ticket-lanes/ticket/:ticketId/lane",
  isAuth,
  TicketLaneController.moveTicket
);
ticketLaneRoutes.get("/ticket-lanes/:id", isAuth, TicketLaneController.show);

export default ticketLaneRoutes;
