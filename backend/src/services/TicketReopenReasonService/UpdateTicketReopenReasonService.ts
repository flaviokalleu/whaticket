import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import TicketReopenReason from "../../models/TicketReopenReason";
import ShowTicketReopenReasonService from "./ShowTicketReopenReasonService";

interface Request {
  id: number | string;
  companyId: number;
  name?: string;
}

const UpdateTicketReopenReasonService = async ({
  id,
  companyId,
  name
}: Request): Promise<TicketReopenReason> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_REOPEN_REASON_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const reopenReason = await ShowTicketReopenReasonService({ id, companyId });

  if (name) {
    const existing = await TicketReopenReason.findOne({
      where: { name, companyId, id: { [Op.ne]: id } }
    });

    if (existing) {
      throw new AppError("ERR_REOPEN_REASON_ALREADY_EXISTS");
    }
  }

  await reopenReason.update({ name });

  return reopenReason;
};

export default UpdateTicketReopenReasonService;
