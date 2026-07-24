import AppError from "../../errors/AppError";
import BoardTask from "../../models/BoardTask";
import ShowBoardTaskService from "./ShowBoardTaskService";

interface TaskData {
  title?: string;
  description?: string;
  assignedUserId?: number | null;
  dueDate?: Date | null;
  position?: number;
}

const UpdateBoardTaskService = async (
  taskId: number | string,
  companyId: number,
  taskData: TaskData
): Promise<BoardTask> => {
  const task = await ShowBoardTaskService(taskId, companyId);

  if (taskData.title !== undefined && !taskData.title) {
    throw new AppError("ERR_BOARD_TASK_INVALID_TITLE");
  }

  await task.update(taskData);

  return task;
};

export default UpdateBoardTaskService;
