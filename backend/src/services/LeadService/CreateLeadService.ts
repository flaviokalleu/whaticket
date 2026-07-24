import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Lead from "../../models/Lead";
import LeadPipeline from "../../models/LeadPipeline";
import ShowLeadService from "./ShowLeadService";

interface Request {
  leadPipelineId?: number;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: string;
  userId?: number;
  companyId: number;
}

const CreateLeadService = async (leadData: Request): Promise<Lead> => {
  const { name, companyId } = leadData;

  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_LEAD_INVALID_NAME")
      .required("ERR_LEAD_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  let { leadPipelineId } = leadData;

  if (leadPipelineId) {
    const pipeline = await LeadPipeline.findOne({
      where: { id: leadPipelineId, companyId }
    });
    if (!pipeline) {
      throw new AppError("ERR_LEAD_INVALID_PIPELINE");
    }
  } else {
    const [defaultPipeline] = await LeadPipeline.findOrCreate({
      where: { companyId, name: "Padrão" },
      defaults: { companyId, name: "Padrão" } as LeadPipeline
    });
    leadPipelineId = defaultPipeline.id;
  }

  const lead = await Lead.create({ ...leadData, leadPipelineId });

  return ShowLeadService(lead.id, companyId);
};

export default CreateLeadService;
