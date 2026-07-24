import Flow from "../../models/Flow";
import ShowFlowService from "./ShowFlowService";

interface FlowData {
  name?: string;
  nodes?: unknown[];
  edges?: unknown[];
  isActive?: boolean;
}

interface Request {
  flowData: FlowData;
  flowId: string | number;
  companyId: number;
}

const UpdateFlowService = async ({
  flowData,
  flowId,
  companyId
}: Request): Promise<Flow> => {
  const flow = await ShowFlowService(flowId, companyId);

  const { name, nodes, edges, isActive } = flowData;

  await flow.update({
    ...(name !== undefined && { name }),
    ...(nodes !== undefined && { nodes }),
    ...(edges !== undefined && { edges }),
    ...(isActive !== undefined && { isActive })
  });

  await flow.reload();

  return flow;
};

export default UpdateFlowService;
