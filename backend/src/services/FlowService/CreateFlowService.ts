import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import AppError from "../../errors/AppError";
import Flow from "../../models/Flow";

interface Request {
  name: string;
  nodes?: unknown[];
  edges?: unknown[];
  isActive?: boolean;
  companyId: number;
}

const CreateFlowService = async ({
  name,
  nodes = [],
  edges = [],
  isActive = true,
  companyId
}: Request): Promise<Flow> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_FLOW_INVALID_NAME")
      .required("ERR_FLOW_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const flow = await Flow.create({
    name,
    nodes,
    edges,
    isActive,
    companyId,
    webhookToken: uuidv4()
  } as Flow);

  return flow;
};

export default CreateFlowService;
