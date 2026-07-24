import ShowPipelineStageService from "./ShowPipelineStageService";

const DeletePipelineStageService = async (
  stageId: number | string,
  companyId: number
): Promise<void> => {
  const stage = await ShowPipelineStageService(stageId, companyId);

  await stage.destroy();
};

export default DeletePipelineStageService;
