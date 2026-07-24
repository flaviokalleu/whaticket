import Pipeline from "../../models/Pipeline";
import PipelineStage from "../../models/PipelineStage";

const ListPipelinesService = async (
  companyId: number
): Promise<Pipeline[]> => {
  const pipelines = await Pipeline.findAll({
    where: { companyId },
    include: [{ model: PipelineStage, as: "stages" }],
    order: [["name", "ASC"]]
  });

  return pipelines;
};

export default ListPipelinesService;
