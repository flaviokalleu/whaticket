import Deal from "../../models/Deal";
import ShowDealService from "./ShowDealService";

interface Request {
  title?: string;
  value?: number;
  contactId?: number;
  userId?: number;
  stageId?: number;
  status?: "open" | "won" | "lost";
}

const UpdateDealService = async (
  dealId: number | string,
  companyId: number,
  dealData: Request
): Promise<Deal> => {
  const deal = await ShowDealService(dealId, companyId);

  await deal.update(dealData);

  return ShowDealService(dealId, companyId);
};

export default UpdateDealService;
