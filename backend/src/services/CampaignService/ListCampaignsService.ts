import Campaign from "../../models/Campaign";
import Whatsapp from "../../models/Whatsapp";

const ListCampaignsService = async (companyId: number): Promise<Campaign[]> => {
  const campaigns = await Campaign.findAll({
    where: { companyId },
    include: [{ model: Whatsapp, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  return campaigns;
};

export default ListCampaignsService;
