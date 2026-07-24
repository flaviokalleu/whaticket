import AppError from "../../errors/AppError";
import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

interface ItemData {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

const UpdateBoardTaskChecklistItemService = async (
  taskId: number | string,
  itemId: number | string,
  companyId: number,
  itemData: ItemData
): Promise<BoardTaskChecklistItem> => {
  const item = await BoardTaskChecklistItem.findOne({
    where: { id: itemId, taskId, companyId }
  });

  if (!item) {
    throw new AppError("ERR_BOARD_TASK_CHECKLIST_ITEM_NOT_FOUND", 404);
  }

  await item.update(itemData);

  return item;
};

export default UpdateBoardTaskChecklistItemService;
