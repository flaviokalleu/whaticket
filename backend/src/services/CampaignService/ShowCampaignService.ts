import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import Whatsapp from "../../models/Whatsapp";
import CampaignContact from "../../models/CampaignContact";
import Contact from "../../models/Contact";

const ShowCampaignService = async (
  campaignId: number | string,
  companyId: number
): Promise<Campaign> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId },
    include: [
      { model: Whatsapp, attributes: ["id", "name"] },
      {
        model: CampaignContact,
        include: [{ model: Contact, attributes: ["id", "name", "number"] }]
      }
    ]
  });

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }

  return campaign;
};

export default ShowCampaignService;
