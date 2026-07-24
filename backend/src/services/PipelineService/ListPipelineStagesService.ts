import PipelineStage from "../../models/PipelineStage";

const ListPipelineStagesService = async (
  pipelineId: number | string,
  companyId: number
): Promise<PipelineStage[]> => {
  const stages = await PipelineStage.findAll({
    where: { pipelineId, companyId },
    order: [["position", "ASC"]]
  });

  return stages;
};

export default ListPipelineStagesService;
