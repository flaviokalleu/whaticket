import ShowTicketService from "./ShowTicketService";
import Ticket from "../../models/Ticket";

const UpdateTicketTagsService = async (
  ticketId: number | string,
  tagIds: number[]
): Promise<Ticket> => {
  const ticket = await ShowTicketService(ticketId);

  await ticket.$set("tags", tagIds);

  await ticket.reload();

  return ticket;
};

export default UpdateTicketTagsService;
