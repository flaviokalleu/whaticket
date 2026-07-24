import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import UserRating from "../../models/UserRating";

interface Request {
  ticketId: number | string;
  userId: number | string;
  rate: number;
  comment?: string;
  companyId: number;
}

const CreateUserRatingService = async ({
  ticketId,
  userId,
  rate,
  comment,
  companyId
}: Request): Promise<UserRating> => {
  const schema = Yup.object().shape({
    rate: Yup.number()
      .min(1, "ERR_RATING_INVALID_RATE")
      .max(5, "ERR_RATING_INVALID_RATE")
      .required("ERR_RATING_INVALID_RATE")
  });

  try {
    await schema.validate({ rate });
  } catch (err) {
    throw new AppError(err.message);
  }

  const ticket = await Ticket.findOne({ where: { id: ticketId, companyId } });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const existing = await UserRating.findOne({ where: { ticketId } });

  if (existing) {
    throw new AppError("ERR_RATING_ALREADY_EXISTS");
  }

  const rating = await UserRating.create({
    ticketId: ticket.id,
    userId,
    rate,
    comment,
    companyId
  });

  return rating;
};

export default CreateUserRatingService;
