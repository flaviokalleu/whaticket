import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import ShowCampaignService from "./ShowCampaignService";

const DuplicateCampaignService = async (
  campaignId: number | string,
  companyId: number,
  createdBy: number
): Promise<Campaign> => {
  const original = await ShowCampaignService(campaignId, companyId);

  const duplicate = await Campaign.create({
    name: `${original.name} (copy)`,
    whatsappId: original.whatsappId,
    body: original.body,
    mediaUrl: original.mediaUrl,
    intervalSeconds: original.intervalSeconds,
    status: "draft",
    scheduledFor: null,
    createdBy,
    companyId
  } as Campaign);

  const originalContacts = await CampaignContact.findAll({
    where: { campaignId: original.id, companyId }
  });

  if (originalContacts.length) {
    await CampaignContact.bulkCreate(
      originalContacts.map(cc => ({
        campaignId: duplicate.id,
        contactId: cc.contactId,
        companyId,
        status: "pending"
      })) as CampaignContact[]
    );
  }

  return ShowCampaignService(duplicate.id, companyId);
};

export default DuplicateCampaignService;
