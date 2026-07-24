import LeadPipeline from "../../models/LeadPipeline";

const ListLeadPipelinesService = async (
  companyId: number
): Promise<LeadPipeline[]> => {
  const leadPipelines = await LeadPipeline.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return leadPipelines;
};

export default ListLeadPipelinesService;
