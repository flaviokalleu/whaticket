import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ContactCustomField from "../../models/ContactCustomField";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Message from "../../models/Message";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  contactId: number;
}

const ExportContactDataService = async ({
  companyId,
  contactId
}: Request): Promise<Record<string, any>> => {
  const contact = await Contact.findOne({
    where: { id: contactId, companyId },
    include: [{ model: ContactCustomField, as: "extraInfo" }]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  const tickets = await Ticket.findAll({
    where: { contactId, companyId },
    include: [
      { model: Queue, attributes: ["id", "name"] },
      { model: Tag, attributes: ["id", "name"], through: { attributes: [] } }
    ]
  });

  const ticketsData = await Promise.all(
    tickets.map(async ticket => {
      const messageCount = await Message.count({
        where: { ticketId: ticket.id }
      });

      return {
        id: ticket.id,
        status: ticket.status,
        createdAt: ticket.createdAt,
        queue: ticket.queue
          ? { id: ticket.queue.id, name: ticket.queue.name }
          : null,
        tags: (ticket.tags || []).map(tag => ({
          id: tag.id,
          name: tag.name
        })),
        messageCount
      };
    })
  );

  return {
    contact: {
      id: contact.id,
      name: contact.name,
      number: contact.number,
      lid: contact.lid,
      email: contact.email,
      profilePicUrl: contact.profilePicUrl,
      isGroup: contact.isGroup,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    },
    extraInfo: (contact.extraInfo || []).map(field => ({
      id: field.id,
      name: field.name,
      value: field.value
    })),
    tickets: ticketsData,
    exportedAt: new Date().toISOString()
  };
};

export default ExportContactDataService;
