import * as Yup from "yup";
import AppError from "../../errors/AppError";
import LeadInteraction from "../../models/LeadInteraction";
import ShowLeadService from "./ShowLeadService";

interface Request {
  leadId: number | string;
  userId: number;
  companyId: number;
  type: string;
  body?: string;
}

const CreateLeadInteractionService = async ({
  leadId,
  userId,
  companyId,
  type,
  body
}: Request): Promise<LeadInteraction> => {
  const schema = Yup.object().shape({
    type: Yup.string().required("ERR_LEAD_INTERACTION_INVALID_TYPE")
  });

  try {
    await schema.validate({ type });
  } catch (err) {
    throw new AppError(err.message);
  }

  // Ensures the lead belongs to the requesting company
  await ShowLeadService(leadId, companyId);

  const interaction = await LeadInteraction.create({
    leadId,
    userId,
    companyId,
    type,
    body
  });

  return interaction;
};

export default CreateLeadInteractionService;
