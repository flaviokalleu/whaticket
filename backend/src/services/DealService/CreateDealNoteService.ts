import * as Yup from "yup";
import AppError from "../../errors/AppError";
import DealNote from "../../models/DealNote";
import ShowDealService from "./ShowDealService";

interface Request {
  dealId: number | string;
  userId: number;
  companyId: number;
  body: string;
}

const CreateDealNoteService = async ({
  dealId,
  userId,
  companyId,
  body
}: Request): Promise<DealNote> => {
  const schema = Yup.object().shape({
    body: Yup.string().required("ERR_DEAL_NOTE_INVALID_BODY")
  });

  try {
    await schema.validate({ body });
  } catch (err) {
    throw new AppError(err.message);
  }

  // Ensures the deal belongs to the requesting company
  await ShowDealService(dealId, companyId);

  const note = await DealNote.create({
    dealId,
    userId,
    companyId,
    body
  });

  return note;
};

export default CreateDealNoteService;
