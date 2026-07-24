import AppError from "../../errors/AppError";
import ScheduledMessage from "../../models/ScheduledMessage";

interface Request {
  id: string | number;
  companyId: number;
  body?: string;
  mediaUrl?: string;
  scheduledFor?: Date | string;
  ticketId?: number;
  contactId?: number;
  whatsappId?: number;
}

const UpdateScheduledMessageService = async ({
  id,
  companyId,
  ...updateData
}: Request): Promise<ScheduledMessage> => {
  const scheduledMessage = await ScheduledMessage.findOne({
    where: { id, companyId }
  });

  if (!scheduledMessage) {
    throw new AppError("ERR_NO_SCHEDULED_MESSAGE_FOUND", 404);
  }

  if (scheduledMessage.status !== "pending") {
    throw new AppError("ERR_SCHEDULED_MESSAGE_NOT_EDITABLE");
  }

  await scheduledMessage.update(updateData);

  return scheduledMessage;
};

export default UpdateScheduledMessageService;
