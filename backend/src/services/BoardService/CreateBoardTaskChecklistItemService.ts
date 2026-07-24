import AppError from "../../errors/AppError";
import BoardTask from "../../models/BoardTask";
import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

interface ItemData {
  title: string;
  isCompleted?: boolean;
  position?: number;
}

const CreateBoardTaskChecklistItemService = async (
  taskId: number | string,
  companyId: number,
  itemData: ItemData
): Promise<BoardTaskChecklistItem> => {
  const task = await BoardTask.findOne({ where: { id: taskId, companyId } });

  if (!task) {
    throw new AppError("ERR_BOARD_TASK_NOT_FOUND", 404);
  }

  let { position } = itemData;

  if (position === undefined) {
    const lastItem = await BoardTaskChecklistItem.findOne({
      where: { taskId, companyId },
      order: [["position", "DESC"]]
    });
    position = lastItem ? lastItem.position + 1 : 0;
  }

  const item = await BoardTaskChecklistItem.create({
    ...itemData,
    position,
    taskId: +taskId,
    companyId
  });

  return item;
};

export default CreateBoardTaskChecklistItemService;
