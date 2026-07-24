import ShowPipelineService from "./ShowPipelineService";

const DeletePipelineService = async (
  pipelineId: number | string,
  companyId: number
): Promise<void> => {
  const pipeline = await ShowPipelineService(pipelineId, companyId);

  await pipeline.destroy();
};

export default DeletePipelineService;
