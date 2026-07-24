import Flow from "../../models/Flow";

const ListFlowsService = async (companyId: number): Promise<Flow[]> => {
  const flows = await Flow.findAll({
    where: { companyId },
    order: [["updatedAt", "DESC"]]
  });

  return flows;
};

export default ListFlowsService;
