import AppError from "../../errors/AppError";
import PipelineStage from "../../models/PipelineStage";

const ShowPipelineStageService = async (
  stageId: number | string,
  companyId: number
): Promise<PipelineStage> => {
  const stage = await PipelineStage.findOne({
    where: { id: stageId, companyId }
  });

  if (!stage) {
    throw new AppError("ERR_STAGE_NOT_FOUND", 404);
  }

  return stage;
};

export default ShowPipelineStageService;
