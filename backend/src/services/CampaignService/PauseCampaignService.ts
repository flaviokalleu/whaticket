import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CampaignLog from "../../models/CampaignLog";
import ShowCampaignService from "./ShowCampaignService";

const PauseCampaignService = async (
  campaignId: number | string,
  companyId: number
): Promise<Campaign> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  if (campaign.status !== "running") {
    throw new AppError("ERR_CAMPAIGN_NOT_RUNNING");
  }

  await campaign.update({ status: "paused" });

  await CampaignLog.create({
    campaignId: campaign.id,
    companyId,
    event: "paused"
  } as CampaignLog);

  return ShowCampaignService(campaignId, companyId);
};

export default PauseCampaignService;
