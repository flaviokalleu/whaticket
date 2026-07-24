import AppError from "../../errors/AppError";
import TicketReopenReason from "../../models/TicketReopenReason";

interface Request {
  id: number | string;
  companyId: number;
}

const ShowTicketReopenReasonService = async ({
  id,
  companyId
}: Request): Promise<TicketReopenReason> => {
  const reopenReason = await TicketReopenReason.findOne({
    where: { id, companyId }
  });

  if (!reopenReason) {
    throw new AppError("ERR_REOPEN_REASON_NOT_FOUND", 404);
  }

  return reopenReason;
};

export default ShowTicketReopenReasonService;
