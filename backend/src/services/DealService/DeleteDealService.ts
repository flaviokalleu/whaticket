import ShowDealService from "./ShowDealService";

const DeleteDealService = async (
  dealId: number | string,
  companyId: number
): Promise<void> => {
  const deal = await ShowDealService(dealId, companyId);

  await deal.destroy();
};

export default DeleteDealService;
