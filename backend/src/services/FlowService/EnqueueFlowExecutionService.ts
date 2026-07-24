import Flow from "../../models/Flow";
import FlowExecution from "../../models/FlowExecution";
import { genericQueue } from "../../queue/queues";

interface Request {
  flow: Flow;
  input?: Record<string, unknown> | null;
}

// Creates a pending execution row and hands the actual work to the BullMQ
// worker, so the HTTP request (or inbound webhook) returns immediately.
const EnqueueFlowExecutionService = async ({
  flow,
  input = null
}: Request): Promise<FlowExecution> => {
  const execution = await FlowExecution.create({
    flowId: flow.id,
    companyId: flow.companyId,
    status: "pending",
    input,
    log: []
  } as unknown as FlowExecution);

  await genericQueue.add("flow-execute", {
    companyId: flow.companyId,
    type: "flow-execute",
    payload: { flowId: flow.id, executionId: execution.id }
  });

  return execution;
};

export default EnqueueFlowExecutionService;
