import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Pipeline from "../../models/Pipeline";
import ShowPipelineService from "./ShowPipelineService";

interface Request {
  name?: string;
}

const UpdatePipelineService = async (
  pipelineId: number | string,
  companyId: number,
  pipelineData: Request
): Promise<Pipeline> => {
  const { name } = pipelineData;

  const schema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_PIPELINE_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const pipeline = await ShowPipelineService(pipelineId, companyId);

  await pipeline.update(pipelineData);

  return pipeline;
};

export default UpdatePipelineService;
