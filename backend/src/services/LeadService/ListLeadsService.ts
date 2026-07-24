import { WhereOptions } from "sequelize";
import Lead from "../../models/Lead";
import LeadPipeline from "../../models/LeadPipeline";
import User from "../../models/User";

interface Request {
  companyId: number;
  leadPipelineId?: number | string;
  status?: string;
  userId?: number | string;
}

const ListLeadsService = async ({
  companyId,
  leadPipelineId,
  status,
  userId
}: Request): Promise<Lead[]> => {
  const where: WhereOptions = { companyId };

  if (leadPipelineId) where.leadPipelineId = leadPipelineId;
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const leads = await Lead.findAll({
    where,
    include: [
      { model: LeadPipeline, as: "leadPipeline" },
      { model: User, as: "user", attributes: ["id", "name"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  return leads;
};

export default ListLeadsService;
