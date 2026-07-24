import AppError from "../../errors/AppError";
import UserRating from "../../models/UserRating";

interface Request {
  ticketId: number | string;
  companyId: number;
}

const GetTicketRatingService = async ({
  ticketId,
  companyId
}: Request): Promise<UserRating> => {
  const rating = await UserRating.findOne({
    where: { ticketId, companyId }
  });

  if (!rating) {
    throw new AppError("ERR_RATING_NOT_FOUND", 404);
  }

  return rating;
};

export default GetTicketRatingService;
