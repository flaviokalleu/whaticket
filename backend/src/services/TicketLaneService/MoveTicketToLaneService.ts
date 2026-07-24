import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import TicketLane from "../../models/TicketLane";

interface MoveData {
  ticketId: number | string;
  ticketLaneId: number | string | null;
  companyId: number;
}

const MoveTicketToLaneService = async ({
  ticketId,
  ticketLaneId,
  companyId
}: MoveData): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id: ticketId, companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  if (ticketLaneId !== null && ticketLaneId !== undefined) {
    const lane = await TicketLane.findOne({
      where: { id: ticketLaneId, companyId }
    });

    if (!lane) {
      throw new AppError("ERR_TICKET_LANE_NOT_FOUND", 404);
    }
  }

  await ticket.update({ ticketLaneId });

  return ticket;
};

export default MoveTicketToLaneService;
