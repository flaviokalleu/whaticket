import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ShowCampaignService from "./ShowCampaignService";

interface CampaignData {
  name?: string;
  whatsappId?: number;
  body?: string;
  mediaUrl?: string | null;
  scheduledFor?: Date | string | null;
  intervalSeconds?: number;
}

const UpdateCampaignService = async (
  campaignId: number | string,
  companyId: number,
  campaignData: CampaignData
): Promise<Campaign> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  if (["running", "completed", "cancelled"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANNOT_BE_EDITED");
  }

  const { scheduledFor, ...rest } = campaignData;

  await campaign.update({
    ...rest,
    ...(scheduledFor !== undefined
      ? { scheduledFor: scheduledFor ? new Date(scheduledFor) : null }
      : {})
  });

  return ShowCampaignService(campaignId, companyId);
};

export default UpdateCampaignService;
