import LeadInteraction from "../../models/LeadInteraction";
import User from "../../models/User";

const ListLeadInteractionsService = async (
  leadId: number | string,
  companyId: number
): Promise<LeadInteraction[]> => {
  const interactions = await LeadInteraction.findAll({
    where: { leadId, companyId },
    include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  return interactions;
};

export default ListLeadInteractionsService;
