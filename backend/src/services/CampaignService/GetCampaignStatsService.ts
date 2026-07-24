import CampaignContact from "../../models/CampaignContact";
import ShowCampaignService from "./ShowCampaignService";

interface CampaignStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  status: string;
}

const GetCampaignStatsService = async (
  campaignId: number | string,
  companyId: number
): Promise<CampaignStats> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  const [total, pending, sent, failed] = await Promise.all([
    CampaignContact.count({ where: { campaignId: campaign.id, companyId } }),
    CampaignContact.count({
      where: { campaignId: campaign.id, companyId, status: "pending" }
    }),
    CampaignContact.count({
      where: { campaignId: campaign.id, companyId, status: "sent" }
    }),
    CampaignContact.count({
      where: { campaignId: campaign.id, companyId, status: "failed" }
    })
  ]);

  return { total, pending, sent, failed, status: campaign.status };
};

export default GetCampaignStatsService;
