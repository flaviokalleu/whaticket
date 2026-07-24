import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import TicketReopenReason from "../../models/TicketReopenReason";
import TicketReopenLog from "../../models/TicketReopenLog";

interface Request {
  ticketId: number | string;
  reopenReasonId: number | string;
  userId: number | string;
  companyId: number;
}

// Standalone service: records a TicketReopenLog row for a ticket that was
// reopened. This is NOT yet wired into UpdateTicketService. It should
// eventually be called from there whenever a ticket's `status` transitions
// from "closed" to "open"/"pending" (i.e. `oldStatus === "closed" &&
// ["open", "pending"].includes(newStatus)`), passing the reopening user's id
// and a reopenReasonId supplied by the frontend.
const LogTicketReopenService = async ({
  ticketId,
  reopenReasonId,
  userId,
  companyId
}: Request): Promise<TicketReopenLog> => {
  const ticket = await Ticket.findOne({ where: { id: ticketId, companyId } });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const reopenReason = await TicketReopenReason.findOne({
    where: { id: reopenReasonId, companyId }
  });

  if (!reopenReason) {
    throw new AppError("ERR_REOPEN_REASON_NOT_FOUND", 404);
  }

  const reopenLog = await TicketReopenLog.create({
    ticketId: ticket.id,
    reopenReasonId: reopenReason.id,
    userId
  });

  return reopenLog;
};

export default LogTicketReopenService;
