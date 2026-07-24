import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import CampaignLog from "../../models/CampaignLog";
import { campaignQueue } from "../../queue/queues";
import ShowCampaignService from "./ShowCampaignService";

const StartCampaignService = async (
  campaignId: number | string,
  companyId: number
): Promise<Campaign> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  if (!["draft", "scheduled", "paused"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANNOT_BE_STARTED");
  }

  const pendingCount = await CampaignContact.count({
    where: { campaignId: campaign.id, companyId, status: "pending" }
  });

  if (!pendingCount) {
    throw new AppError("ERR_CAMPAIGN_NO_PENDING_CONTACTS");
  }

  await campaign.update({ status: "running" });

  await CampaignLog.create({
    campaignId: campaign.id,
    companyId,
    event: "started",
    message: `Campaign started with ${pendingCount} pending contacts`
  } as CampaignLog);

  await campaignQueue.add("send", {
    companyId,
    campaignId: campaign.id
  });

  return ShowCampaignService(campaignId, companyId);
};

export default StartCampaignService;
