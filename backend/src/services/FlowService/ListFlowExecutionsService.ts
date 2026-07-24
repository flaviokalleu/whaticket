import FlowExecution from "../../models/FlowExecution";

const ListFlowExecutionsService = async (
  flowId: string | number,
  companyId: number
): Promise<FlowExecution[]> => {
  const executions = await FlowExecution.findAll({
    where: { flowId, companyId },
    order: [["createdAt", "DESC"]],
    limit: 20
  });

  return executions;
};

export default ListFlowExecutionsService;
