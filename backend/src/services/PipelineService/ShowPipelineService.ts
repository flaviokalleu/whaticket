import AppError from "../../errors/AppError";
import Pipeline from "../../models/Pipeline";
import PipelineStage from "../../models/PipelineStage";

const ShowPipelineService = async (
  pipelineId: number | string,
  companyId: number
): Promise<Pipeline> => {
  const pipeline = await Pipeline.findOne({
    where: { id: pipelineId, companyId },
    include: [{ model: PipelineStage, as: "stages" }]
  });

  if (!pipeline) {
    throw new AppError("ERR_PIPELINE_NOT_FOUND", 404);
  }

  return pipeline;
};

export default ShowPipelineService;
