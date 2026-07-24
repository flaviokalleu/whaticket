import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

const ListBoardTaskChecklistItemsService = async (
  taskId: number | string,
  companyId: number
): Promise<BoardTaskChecklistItem[]> => {
  const items = await BoardTaskChecklistItem.findAll({
    where: { taskId, companyId },
    order: [["position", "ASC"]]
  });

  return items;
};

export default ListBoardTaskChecklistItemsService;
