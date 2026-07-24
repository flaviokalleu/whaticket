import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TicketReopenReason from "../../models/TicketReopenReason";

interface Request {
  name: string;
  companyId: number;
}

const CreateTicketReopenReasonService = async ({
  name,
  companyId
}: Request): Promise<TicketReopenReason> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_REOPEN_REASON_INVALID_NAME")
      .required("ERR_REOPEN_REASON_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const existing = await TicketReopenReason.findOne({
    where: { name, companyId }
  });

  if (existing) {
    throw new AppError("ERR_REOPEN_REASON_ALREADY_EXISTS");
  }

  const reopenReason = await TicketReopenReason.create({ name, companyId });

  return reopenReason;
};

export default CreateTicketReopenReasonService;
