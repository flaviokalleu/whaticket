import AppError from "../../errors/AppError";
import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

const DeleteBoardTaskChecklistItemService = async (
  taskId: number | string,
  itemId: number | string,
  companyId: number
): Promise<void> => {
  const item = await BoardTaskChecklistItem.findOne({
    where: { id: itemId, taskId, companyId }
  });

  if (!item) {
    throw new AppError("ERR_BOARD_TASK_CHECKLIST_ITEM_NOT_FOUND", 404);
  }

  await item.destroy();
};

export default DeleteBoardTaskChecklistItemService;
