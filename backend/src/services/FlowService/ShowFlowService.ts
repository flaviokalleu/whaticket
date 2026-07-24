import AppError from "../../errors/AppError";
import Flow from "../../models/Flow";

const ShowFlowService = async (
  flowId: string | number,
  companyId: number
): Promise<Flow> => {
  const flow = await Flow.findOne({ where: { id: flowId, companyId } });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  return flow;
};

export default ShowFlowService;
