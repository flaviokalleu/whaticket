import * as Yup from "yup";
import AppError from "../../errors/AppError";
import LeadPipeline from "../../models/LeadPipeline";

interface Request {
  name: string;
  companyId: number;
}

const CreateLeadPipelineService = async ({
  name,
  companyId
}: Request): Promise<LeadPipeline> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_LEAD_PIPELINE_INVALID_NAME")
      .required("ERR_LEAD_PIPELINE_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const leadPipeline = await LeadPipeline.create({ name, companyId });

  return leadPipeline;
};

export default CreateLeadPipelineService;
