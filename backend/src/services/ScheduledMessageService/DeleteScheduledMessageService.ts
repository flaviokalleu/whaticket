import AppError from "../../errors/AppError";
import ScheduledMessage from "../../models/ScheduledMessage";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteScheduledMessageService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const scheduledMessage = await ScheduledMessage.findOne({
    where: { id, companyId }
  });

  if (!scheduledMessage) {
    throw new AppError("ERR_NO_SCHEDULED_MESSAGE_FOUND", 404);
  }

  await scheduledMessage.destroy();
};

export default DeleteScheduledMessageService;
