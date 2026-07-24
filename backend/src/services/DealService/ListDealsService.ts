import { WhereOptions } from "sequelize";
import Deal from "../../models/Deal";
import PipelineStage from "../../models/PipelineStage";
import Pipeline from "../../models/Pipeline";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface Request {
  companyId: number;
  pipelineId?: number | string;
  stageId?: number | string;
  status?: string;
}

const ListDealsService = async ({
  companyId,
  pipelineId,
  stageId,
  status
}: Request): Promise<Deal[]> => {
  const where: WhereOptions = { companyId };

  if (pipelineId) where.pipelineId = pipelineId;
  if (stageId) where.stageId = stageId;
  if (status) where.status = status;

  const deals = await Deal.findAll({
    where,
    include: [
      { model: Pipeline, as: "pipeline" },
      { model: PipelineStage, as: "stage" },
      { model: Contact, as: "contact" },
      { model: User, as: "user", attributes: ["id", "name"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  return deals;
};

export default ListDealsService;
