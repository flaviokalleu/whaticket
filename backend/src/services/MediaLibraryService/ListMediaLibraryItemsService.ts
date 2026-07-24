import MediaLibraryItem from "../../models/MediaLibraryItem";
import User from "../../models/User";

interface Request {
  companyId: number;
}

const ListMediaLibraryItemsService = async ({
  companyId
}: Request): Promise<MediaLibraryItem[]> => {
  const items = await MediaLibraryItem.findAll({
    where: { companyId },
    include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  return items;
};

export default ListMediaLibraryItemsService;
