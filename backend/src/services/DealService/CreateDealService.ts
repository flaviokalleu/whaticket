import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Deal from "../../models/Deal";
import ShowDealService from "./ShowDealService";

interface Request {
  pipelineId: number;
  stageId: number;
  contactId?: number;
  title: string;
  value?: number;
  userId?: number;
  companyId: number;
}

const CreateDealService = async (dealData: Request): Promise<Deal> => {
  const { title, pipelineId, stageId } = dealData;

  const schema = Yup.object().shape({
    title: Yup.string()
      .min(2, "ERR_DEAL_INVALID_TITLE")
      .required("ERR_DEAL_INVALID_TITLE"),
    pipelineId: Yup.number().required("ERR_DEAL_INVALID_PIPELINE"),
    stageId: Yup.number().required("ERR_DEAL_INVALID_STAGE")
  });

  try {
    await schema.validate({ title, pipelineId, stageId });
  } catch (err) {
    throw new AppError(err.message);
  }

  const deal = await Deal.create(dealData);

  return ShowDealService(deal.id, dealData.companyId);
};

export default CreateDealService;
