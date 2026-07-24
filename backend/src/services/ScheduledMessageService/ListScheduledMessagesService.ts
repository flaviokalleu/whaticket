import { WhereOptions } from "sequelize";
import ScheduledMessage from "../../models/ScheduledMessage";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number;
  contactId?: string | number;
}

const ListScheduledMessagesService = async ({
  companyId,
  contactId
}: Request): Promise<ScheduledMessage[]> => {
  const where: WhereOptions = contactId ? { companyId, contactId } : { companyId };

  const scheduledMessages = await ScheduledMessage.findAll({
    where,
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ],
    order: [["scheduledFor", "ASC"]]
  });

  return scheduledMessages;
};

export default ListScheduledMessagesService;
