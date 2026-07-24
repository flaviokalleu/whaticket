import AppError from "../../errors/AppError";
import Deal from "../../models/Deal";
import PipelineStage from "../../models/PipelineStage";
import ShowDealService from "./ShowDealService";

const MoveDealStageService = async (
  dealId: number | string,
  stageId: number | string,
  companyId: number
): Promise<Deal> => {
  const deal = await ShowDealService(dealId, companyId);

  const stage = await PipelineStage.findOne({
    where: { id: stageId, companyId, pipelineId: deal.pipelineId }
  });

  if (!stage) {
    throw new AppError("ERR_STAGE_NOT_FOUND", 404);
  }

  await deal.update({ stageId: stage.id });

  return ShowDealService(dealId, companyId);
};

export default MoveDealStageService;
