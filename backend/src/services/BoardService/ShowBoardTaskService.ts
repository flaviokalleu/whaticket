import AppError from "../../errors/AppError";
import BoardTask from "../../models/BoardTask";
import BoardTaskTag from "../../models/BoardTaskTag";
import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

const ShowBoardTaskService = async (
  taskId: number | string,
  companyId: number
): Promise<BoardTask> => {
  const task = await BoardTask.findOne({
    where: { id: taskId, companyId },
    include: [
      { model: BoardTaskTag, as: "tags" },
      { model: BoardTaskChecklistItem, as: "checklistItems" }
    ]
  });

  if (!task) {
    throw new AppError("ERR_BOARD_TASK_NOT_FOUND", 404);
  }

  return task;
};

export default ShowBoardTaskService;
