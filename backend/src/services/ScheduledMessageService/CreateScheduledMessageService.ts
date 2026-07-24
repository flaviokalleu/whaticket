import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ScheduledMessage from "../../models/ScheduledMessage";

interface Request {
  ticketId?: number;
  contactId: number;
  whatsappId: number;
  body: string;
  mediaUrl?: string;
  scheduledFor: Date | string;
  createdBy: number;
  companyId: number;
}

const CreateScheduledMessageService = async (
  data: Request
): Promise<ScheduledMessage> => {
  const schema = Yup.object().shape({
    contactId: Yup.number().required("ERR_SCHEDULED_MESSAGE_INVALID_CONTACT"),
    whatsappId: Yup.number().required(
      "ERR_SCHEDULED_MESSAGE_INVALID_WHATSAPP"
    ),
    body: Yup.string().required("ERR_SCHEDULED_MESSAGE_INVALID_BODY"),
    scheduledFor: Yup.date().required(
      "ERR_SCHEDULED_MESSAGE_INVALID_SCHEDULED_FOR"
    )
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const scheduledMessage = await ScheduledMessage.create({
    ...data,
    status: "pending"
  });

  return scheduledMessage;
};

export default CreateScheduledMessageService;
