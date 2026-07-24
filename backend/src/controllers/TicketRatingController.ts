import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateUserRatingService from "../services/TicketServices/CreateUserRatingService";
import GetTicketRatingService from "../services/TicketServices/GetTicketRatingService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { ticketId } = req.params;

  const rating = await GetTicketRatingService({ ticketId, companyId });

  return res.status(200).json(rating);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { ticketId } = req.params;
  const { userId, rate, comment } = req.body;

  const rating = await CreateUserRatingService({
    ticketId,
    userId,
    rate,
    comment,
    companyId
  });

  const io = getIO();
  io.emit("ticketRating", {
    action: "create",
    rating
  });

  return res.status(200).json(rating);
};
