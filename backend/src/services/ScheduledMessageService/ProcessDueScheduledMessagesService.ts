import { Op } from "sequelize";
import ScheduledMessage from "../../models/ScheduledMessage";
import Contact from "../../models/Contact";
import ShowTicketService from "../TicketServices/ShowTicketService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

/**
 * Finds every pending scheduled message whose scheduledFor date has passed
 * and sends it via the existing WhatsApp message-sending service, updating
 * its status to "sent" or "failed" accordingly.
 *
 * This service does not schedule itself — it must be invoked periodically
 * (e.g. every ~1 minute) by a setInterval/node-cron job wired up elsewhere
 * (see backend/src/server.ts).
 */
const ProcessDueScheduledMessagesService = async (): Promise<void> => {
  const dueMessages = await ScheduledMessage.findAll({
    where: {
      status: "pending",
      scheduledFor: { [Op.lte]: new Date() }
    }
  });

  await Promise.all(
    dueMessages.map(async scheduledMessage => {
      try {
        const contact = await Contact.findByPk(scheduledMessage.contactId);

        if (!contact) {
          throw new Error("ERR_SCHEDULED_MESSAGE_CONTACT_NOT_FOUND");
        }

        const ticket = scheduledMessage.ticketId
          ? await ShowTicketService(scheduledMessage.ticketId)
          : await FindOrCreateTicketService(
              contact,
              scheduledMessage.whatsappId,
              0
            );

        await SendWhatsAppMessage({
          body: scheduledMessage.body,
          ticket
        });

        await scheduledMessage.update({ status: "sent" });
      } catch (err) {
        await scheduledMessage.update({ status: "failed" });
      }
    })
  );
};

export default ProcessDueScheduledMessagesService;
