import ShowFlowService from "./ShowFlowService";

const DeleteFlowService = async (
  flowId: string | number,
  companyId: number
): Promise<void> => {
  const flow = await ShowFlowService(flowId, companyId);
  await flow.destroy();
};

export default DeleteFlowService;
