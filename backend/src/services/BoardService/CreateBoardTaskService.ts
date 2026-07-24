import * as Yup from "yup";
import AppError from "../../errors/AppError";
import BoardLane from "../../models/BoardLane";
import BoardTask from "../../models/BoardTask";

interface TaskData {
  title: string;
  description?: string;
  assignedUserId?: number | null;
  dueDate?: Date | null;
  position?: number;
}

const CreateBoardTaskService = async (
  laneId: number | string,
  companyId: number,
  taskData: TaskData
): Promise<BoardTask> => {
  const { title } = taskData;

  const taskSchema = Yup.object().shape({
    title: Yup.string()
      .min(1, "ERR_BOARD_TASK_INVALID_TITLE")
      .required("ERR_BOARD_TASK_INVALID_TITLE")
  });

  try {
    await taskSchema.validate({ title });
  } catch (err) {
    throw new AppError(err.message);
  }

  const lane = await BoardLane.findOne({ where: { id: laneId, companyId } });

  if (!lane) {
    throw new AppError("ERR_BOARD_LANE_NOT_FOUND", 404);
  }

  let { position } = taskData;

  if (position === undefined) {
    const lastTask = await BoardTask.findOne({
      where: { laneId, companyId },
      order: [["position", "DESC"]]
    });
    position = lastTask ? lastTask.position + 1 : 0;
  }

  const task = await BoardTask.create({
    ...taskData,
    position,
    laneId: +laneId,
    companyId
  });

  return task;
};

export default CreateBoardTaskService;
