import ShowPipelineStageService from "./ShowPipelineStageService";
import PipelineStage from "../../models/PipelineStage";

interface Request {
  name?: string;
  position?: number;
  color?: string;
}

const UpdatePipelineStageService = async (
  stageId: number | string,
  companyId: number,
  stageData: Request
): Promise<PipelineStage> => {
  const stage = await ShowPipelineStageService(stageId, companyId);

  await stage.update(stageData);

  return stage;
};

export default UpdatePipelineStageService;
