import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import NPSResponse from "../../models/NPSResponse";

interface Request {
  contactId: number | string;
  ticketId?: number | string;
  score: number;
  comment?: string;
  companyId: number;
}

const CreateNPSResponseService = async ({
  contactId,
  ticketId,
  score,
  comment,
  companyId
}: Request): Promise<NPSResponse> => {
  const schema = Yup.object().shape({
    score: Yup.number()
      .min(0, "ERR_NPS_INVALID_SCORE")
      .max(10, "ERR_NPS_INVALID_SCORE")
      .required("ERR_NPS_INVALID_SCORE")
  });

  try {
    await schema.validate({ score });
  } catch (err) {
    throw new AppError(err.message);
  }

  const contact = await Contact.findOne({
    where: { id: contactId, companyId }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  const npsResponse = await NPSResponse.create({
    contactId: contact.id,
    ticketId: ticketId || null,
    score,
    comment,
    companyId
  });

  return npsResponse;
};

export default CreateNPSResponseService;
