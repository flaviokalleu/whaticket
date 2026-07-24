import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CampaignLog from "../../models/CampaignLog";
import ShowCampaignService from "./ShowCampaignService";

const CancelCampaignService = async (
  campaignId: number | string,
  companyId: number
): Promise<Campaign> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  if (["completed", "cancelled"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANNOT_BE_CANCELLED");
  }

  await campaign.update({ status: "cancelled" });

  await CampaignLog.create({
    campaignId: campaign.id,
    companyId,
    event: "cancelled"
  } as CampaignLog);

  return ShowCampaignService(campaignId, companyId);
};

export default CancelCampaignService;
