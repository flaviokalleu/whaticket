import DealNote from "../../models/DealNote";
import User from "../../models/User";

const ListDealNotesService = async (
  dealId: number | string,
  companyId: number
): Promise<DealNote[]> => {
  const notes = await DealNote.findAll({
    where: { dealId, companyId },
    include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  return notes;
};

export default ListDealNotesService;
