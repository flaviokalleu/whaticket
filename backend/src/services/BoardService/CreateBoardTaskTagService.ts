import AppError from "../../errors/AppError";
import BoardTask from "../../models/BoardTask";
import BoardTaskTag from "../../models/BoardTaskTag";

interface TagData {
  name: string;
  color: string;
}

const CreateBoardTaskTagService = async (
  taskId: number | string,
  companyId: number,
  tagData: TagData
): Promise<BoardTaskTag> => {
  const task = await BoardTask.findOne({ where: { id: taskId, companyId } });

  if (!task) {
    throw new AppError("ERR_BOARD_TASK_NOT_FOUND", 404);
  }

  const tag = await BoardTaskTag.create({
    ...tagData,
    taskId: +taskId,
    companyId
  });

  return tag;
};

export default CreateBoardTaskTagService;
