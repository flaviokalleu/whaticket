import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Pipeline from "../../models/Pipeline";

interface Request {
  name: string;
  companyId: number;
}

const CreatePipelineService = async ({
  name,
  companyId
}: Request): Promise<Pipeline> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_PIPELINE_INVALID_NAME").required("ERR_PIPELINE_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const pipeline = await Pipeline.create({ name, companyId });

  return pipeline;
};

export default CreatePipelineService;
