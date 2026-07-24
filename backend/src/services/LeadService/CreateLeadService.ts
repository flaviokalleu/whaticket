import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Lead from "../../models/Lead";
import ShowLeadService from "./ShowLeadService";

interface Request {
  leadPipelineId: number;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: string;
  userId?: number;
  companyId: number;
}

const CreateLeadService = async (leadData: Request): Promise<Lead> => {
  const { name, leadPipelineId } = leadData;

  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_LEAD_INVALID_NAME")
      .required("ERR_LEAD_INVALID_NAME"),
    leadPipelineId: Yup.number().required("ERR_LEAD_INVALID_PIPELINE")
  });

  try {
    await schema.validate({ name, leadPipelineId });
  } catch (err) {
    throw new AppError(err.message);
  }

  const lead = await Lead.create(leadData);

  return ShowLeadService(lead.id, leadData.companyId);
};

export default CreateLeadService;
