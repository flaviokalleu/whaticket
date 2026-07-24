import AppError from "../../errors/AppError";
import ShowCampaignService from "./ShowCampaignService";

const DeleteCampaignService = async (
  campaignId: number | string,
  companyId: number
): Promise<void> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  if (campaign.status === "running") {
    throw new AppError("ERR_CAMPAIGN_RUNNING_CANNOT_DELETE");
  }

  await campaign.destroy();
};

export default DeleteCampaignService;
